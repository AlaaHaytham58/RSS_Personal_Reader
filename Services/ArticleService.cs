using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dtos;
using Domain;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class ArticleService : IArticleService
    {
        private readonly IFeedRepository _repository;
        private readonly IDbContextFactory<AppDbContext> _contextFactory;

        public ArticleService(IFeedRepository repository, IDbContextFactory<AppDbContext> contextFactory)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        }

        public async Task<List<ArticleResponse>> GetAllArticlesAsync()
        {
            var feeds = await _repository.GetAllFeedsAsync();
            var articles = await _repository.GetAllArticlesAsync();
            var (readKeys, favoriteKeys) = await GetReadAndFavoriteKeysAsync();

            return articles
                .OrderByDescending(GetSortTimestamp)
                .Select(article =>
                {
                    var feed = feeds.FirstOrDefault(f => f.Id == article.FeedId);
                    var key = (article.FeedId, article.Id);
                    return new ArticleResponse
                    {
                        Id = article.Id,
                        FeedId = article.FeedId,
                        FeedTitle = feed?.Title ?? string.Empty,
                        Title = article.Title,
                        Link = article.Link,
                        Summary = article.Summary,
                        PublishedAt = GetSortTimestamp(article),
                        ImageUrl = article.ImageUrl,
                        IsRead = readKeys.Contains(key),
                        IsFavorite = favoriteKeys.Contains(key)
                    };
                })
                .ToList();
        }

        public async Task<List<ArticleResponse>> GetHistoryAsync(int limit)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            // SQLite can't ORDER BY DateTimeOffset server-side, so sort client-side after fetching.
            var readEntries = (await db.ReadArticles.ToListAsync())
                .OrderByDescending(r => r.ReadAt)
                .Take(limit)
                .ToList();

            if (readEntries.Count == 0)
            {
                return new List<ArticleResponse>();
            }

            var all = await GetAllArticlesAsync();
            var byKey = all.ToDictionary(a => (a.FeedId, a.Id));

            var result = new List<ArticleResponse>();
            foreach (var entry in readEntries)
            {
                if (byKey.TryGetValue((entry.FeedId, entry.ArticleId), out var article))
                {
                    result.Add(article);
                }
            }

            return result;
        }

        public async Task<bool> MarkReadAsync(Guid feedId, string articleId)
        {
            if (string.IsNullOrWhiteSpace(articleId))
            {
                return false;
            }

            await using var db = await _contextFactory.CreateDbContextAsync();
            var exists = await db.ReadArticles.AnyAsync(r => r.FeedId == feedId && r.ArticleId == articleId);
            if (!exists)
            {
                db.ReadArticles.Add(new ReadArticle { FeedId = feedId, ArticleId = articleId, ReadAt = DateTimeOffset.UtcNow });
                await db.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> SetFavoriteAsync(Guid feedId, string articleId, bool isFavorite)
        {
            if (string.IsNullOrWhiteSpace(articleId))
            {
                return false;
            }

            await using var db = await _contextFactory.CreateDbContextAsync();
            var existing = await db.FavoriteArticles.FirstOrDefaultAsync(f => f.FeedId == feedId && f.ArticleId == articleId);

            if (isFavorite)
            {
                if (existing == null)
                {
                    db.FavoriteArticles.Add(new FavoriteArticle { FeedId = feedId, ArticleId = articleId, SavedAt = DateTimeOffset.UtcNow });
                    await db.SaveChangesAsync();
                }
            }
            else if (existing != null)
            {
                db.FavoriteArticles.Remove(existing);
                await db.SaveChangesAsync();
            }

            return true;
        }

        private async Task<(HashSet<(Guid, string)> Read, HashSet<(Guid, string)> Favorite)> GetReadAndFavoriteKeysAsync()
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var read = await db.ReadArticles.Select(r => new { r.FeedId, r.ArticleId }).ToListAsync();
            var favorite = await db.FavoriteArticles.Select(f => new { f.FeedId, f.ArticleId }).ToListAsync();

            return (
                read.Select(r => (r.FeedId, r.ArticleId)).ToHashSet(),
                favorite.Select(f => (f.FeedId, f.ArticleId)).ToHashSet()
            );
        }

        private static DateTimeOffset GetSortTimestamp(Domain.Article article)
        {
            return article.PublishedAt == default ? article.FetchedAt : article.PublishedAt;
        }
    }
}
