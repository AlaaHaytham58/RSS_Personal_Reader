using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Configuration;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Storage
{
    public class EfFeedRepository : IFeedRepository
    {
        private readonly IDbContextFactory<AppDbContext> _contextFactory;
        private readonly SemaphoreSlim _semaphore;
        private readonly AppSettings _settings;
        private readonly ILogger<EfFeedRepository> _logger;

        public EfFeedRepository(IDbContextFactory<AppDbContext> contextFactory, SemaphoreSlim semaphore, AppSettings settings, ILogger<EfFeedRepository> logger)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
            _semaphore = semaphore ?? throw new ArgumentNullException(nameof(semaphore));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<Feed>> GetAllFeedsAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            return await db.Feeds.Include(f => f.Articles).AsNoTracking().Where(f => f.UserId == userId).ToListAsync();
        }

        public async Task<Feed?> GetFeedByIdAsync(Guid id, Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            return await db.Feeds.Include(f => f.Articles).AsNoTracking().FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        }

        [Obsolete("Use AddFeedWithArticlesAsync for atomic writes", false)]
        public Task AddFeedAsync(Feed feed) => AddFeedWithArticlesAsync(feed);

        public async Task AddFeedWithArticlesAsync(Feed feed)
        {
            if (feed == null) throw new ArgumentNullException(nameof(feed));

            await _semaphore.WaitAsync();
            try
            {
                await using var db = await _contextFactory.CreateDbContextAsync();
                if (await db.Feeds.AnyAsync(f => f.Id == feed.Id))
                {
                    _logger.LogWarning("Feed with id {FeedId} already exists, skipping add", feed.Id);
                    return;
                }

                db.Feeds.Add(feed);
                await db.SaveChangesAsync();
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public async Task RemoveFeedAsync(Guid id, Guid userId)
        {
            await _semaphore.WaitAsync();
            try
            {
                await using var db = await _contextFactory.CreateDbContextAsync();
                var feed = await db.Feeds.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
                if (feed != null)
                {
                    db.Feeds.Remove(feed);
                    await db.SaveChangesAsync();
                }
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public async Task UpdateFeedAsync(Feed feed)
        {
            if (feed == null) throw new ArgumentNullException(nameof(feed));

            await _semaphore.WaitAsync();
            try
            {
                await using var db = await _contextFactory.CreateDbContextAsync();
                var existing = await db.Feeds.FirstOrDefaultAsync(f => f.Id == feed.Id);
                if (existing == null)
                {
                    db.Feeds.Add(feed);
                }
                else
                {
                    existing.Url = feed.Url;
                    existing.Title = feed.Title;
                    existing.SiteUrl = feed.SiteUrl;
                    existing.AddedAt = feed.AddedAt;
                    existing.LastRefreshedAt = feed.LastRefreshedAt;
                    existing.LastRefreshStatus = feed.LastRefreshStatus;
                }

                await db.SaveChangesAsync();
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public async Task<List<Article>> GetArticlesByFeedIdAsync(Guid feedId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            return await db.Articles.AsNoTracking().Where(a => a.FeedId == feedId).ToListAsync();
        }

        public async Task<List<Article>> GetAllArticlesAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            return await db.Articles.AsNoTracking()
                .Where(a => db.Feeds.Any(f => f.Id == a.FeedId && f.UserId == userId))
                .ToListAsync();
        }

        public async Task AddArticlesAsync(Guid feedId, List<Article> newArticles)
        {
            if (newArticles == null) throw new ArgumentNullException(nameof(newArticles));

            await _semaphore.WaitAsync();
            try
            {
                await using var db = await _contextFactory.CreateDbContextAsync();

                var existingArticles = await db.Articles.Where(a => a.FeedId == feedId).ToListAsync();
                var existingById = existingArticles.ToDictionary(a => a.Id);

                var toAdd = new List<Article>();
                var hasUpdates = false;
                foreach (var article in newArticles)
                {
                    if (!existingById.TryGetValue(article.Id, out var existing))
                    {
                        article.FeedId = feedId;
                        toAdd.Add(article);
                        continue;
                    }

                    // Backfill fields that a re-fetch may now have but the stored row is missing
                    // (e.g. an image the feed parser couldn't extract on an earlier pass).
                    if (string.IsNullOrWhiteSpace(existing.ImageUrl) && !string.IsNullOrWhiteSpace(article.ImageUrl))
                    {
                        existing.ImageUrl = article.ImageUrl;
                        hasUpdates = true;
                    }
                }

                if (toAdd.Count > 0)
                {
                    db.Articles.AddRange(toAdd);
                }

                if (toAdd.Count > 0 || hasUpdates)
                {
                    await db.SaveChangesAsync();
                }

                // Enforce the per-feed article cap by trimming the oldest rows.
                // SQLite can't ORDER BY DateTimeOffset server-side, so sort client-side after fetching.
                var all = (await db.Articles.Where(a => a.FeedId == feedId).ToListAsync())
                    .OrderByDescending(a => a.PublishedAt)
                    .ToList();

                if (all.Count > _settings.MaxArticlesPerFeed)
                {
                    var toRemove = all.Skip(_settings.MaxArticlesPerFeed).ToList();
                    db.Articles.RemoveRange(toRemove);
                    await db.SaveChangesAsync();
                }
            }
            finally
            {
                _semaphore.Release();
            }
        }
    }
}
