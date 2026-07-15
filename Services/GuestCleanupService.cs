using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Services
{
    // Guests get a real account transparently on first use so they can try the app without
    // signing up; anything not claimed via signup within 7 days is deleted, cascading to
    // their feeds/articles/etc via the existing FK constraints in AppDbContext.
    public class GuestCleanupService : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromHours(6);
        private static readonly TimeSpan GuestLifetime = TimeSpan.FromDays(7);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<GuestCleanupService> _logger;

        public GuestCleanupService(IServiceScopeFactory scopeFactory, ILogger<GuestCleanupService> logger)
        {
            _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(Interval);
            do
            {
                await RunOnceAsync(stoppingToken);
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        private async Task RunOnceAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var contextFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<AppDbContext>>();
                await using var db = await contextFactory.CreateDbContextAsync(cancellationToken);

                // SQLite can't filter DateTimeOffset server-side, so fetch guests and filter client-side.
                var cutoff = DateTimeOffset.UtcNow - GuestLifetime;
                var expiredGuests = (await db.Users.Where(u => u.IsGuest).ToListAsync(cancellationToken))
                    .Where(u => u.CreatedAt < cutoff)
                    .ToList();

                if (expiredGuests.Count > 0)
                {
                    db.Users.RemoveRange(expiredGuests);
                    await db.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Deleted {Count} expired guest account(s).", expiredGuests.Count);
                }
            }
            catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Guest cleanup pass failed.");
            }
        }
    }
}
