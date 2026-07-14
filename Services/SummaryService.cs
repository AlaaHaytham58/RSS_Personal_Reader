using System;
using System.Linq;
using System.Threading.Tasks;
using Configuration;
using Domain;
using Dtos;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class SummaryService : ISummaryService
    {
        private readonly IDbContextFactory<AppDbContext> _contextFactory;
        private readonly IChatService _chatService;
        private readonly AppSettings _settings;

        public SummaryService(IDbContextFactory<AppDbContext> contextFactory, IChatService chatService, AppSettings settings)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
            _chatService = chatService ?? throw new ArgumentNullException(nameof(chatService));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
        }

        public async Task<DailySummaryResponse?> GetDailySummaryAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var existing = await db.DailySummaries.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);

            var isFresh = existing != null
                && existing.GeneratedAt.AddMinutes(_settings.SummaryCacheMinutes) > DateTimeOffset.UtcNow;

            if (isFresh)
            {
                return new DailySummaryResponse { Content = existing!.Content, GeneratedAt = existing.GeneratedAt };
            }

            return await GenerateAndStoreAsync(db, userId, fallback: existing);
        }

        public async Task<DailySummaryResponse?> RefreshDailySummaryAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var existing = await db.DailySummaries.FirstOrDefaultAsync(s => s.UserId == userId);
            return await GenerateAndStoreAsync(db, userId, fallback: existing);
        }

        private async Task<DailySummaryResponse?> GenerateAndStoreAsync(AppDbContext db, Guid userId, DailySummary? fallback)
        {
            var outcome = await _chatService.GenerateDailySummaryAsync(userId);
            if (outcome is not ChatSuccess success)
            {
                // Generation failed (not configured / upstream error) - serve the last good copy if we have one.
                return fallback == null ? null : new DailySummaryResponse { Content = fallback.Content, GeneratedAt = fallback.GeneratedAt };
            }

            var now = DateTimeOffset.UtcNow;
            var existing = await db.DailySummaries.FirstOrDefaultAsync(s => s.UserId == userId);
            if (existing == null)
            {
                db.DailySummaries.Add(new DailySummary { UserId = userId, Content = success.Reply, GeneratedAt = now });
            }
            else
            {
                existing.Content = success.Reply;
                existing.GeneratedAt = now;
            }

            await db.SaveChangesAsync();
            return new DailySummaryResponse { Content = success.Reply, GeneratedAt = now };
        }
    }
}
