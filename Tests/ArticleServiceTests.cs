using Domain;
using Infrastructure.Storage;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Services;
using Xunit;

namespace Tests
{
    public class ArticleServiceTests
    {
        private static IDbContextFactory<AppDbContext> CreateInMemoryContextFactory()
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();
            var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
            using (var db = new AppDbContext(options))
            {
                db.Database.EnsureCreated();
            }

            return new TestDbContextFactory(options);
        }

        private sealed class TestDbContextFactory : IDbContextFactory<AppDbContext>
        {
            private readonly DbContextOptions<AppDbContext> _options;

            public TestDbContextFactory(DbContextOptions<AppDbContext> options)
            {
                _options = options;
            }

            public AppDbContext CreateDbContext() => new AppDbContext(_options);
        }
        [Fact]
        public async Task GetAllArticlesAsync_SortsByPublishedAtDescending_AndFallsBackToFetchedAt()
        {
            var userId = Guid.NewGuid();
            var feed1 = new Feed { Id = Guid.NewGuid(), UserId = userId, Title = "Feed One" };
            var feed2 = new Feed { Id = Guid.NewGuid(), UserId = userId, Title = "Feed Two" };

            var olderPublished = new Article
            {
                Id = "a-1",
                FeedId = feed1.Id,
                Title = "Older published",
                Link = "https://example.com/1",
                Summary = "one",
                PublishedAt = new DateTimeOffset(2024, 1, 1, 12, 0, 0, TimeSpan.Zero),
                FetchedAt = new DateTimeOffset(2024, 1, 1, 12, 5, 0, TimeSpan.Zero)
            };

            var missingPublished = new Article
            {
                Id = "a-2",
                FeedId = feed2.Id,
                Title = "Missing published",
                Link = "https://example.com/2",
                Summary = "two",
                PublishedAt = default,
                FetchedAt = new DateTimeOffset(2024, 1, 2, 9, 30, 0, TimeSpan.Zero)
            };

            var service = new ArticleService(new FakeFeedRepository(
                new[] { feed1, feed2 },
                new[] { olderPublished, missingPublished }), CreateInMemoryContextFactory());

            var result = await service.GetAllArticlesAsync(userId);

            Assert.Equal(2, result.Count);
            Assert.Equal("a-2", result[0].Id);
            Assert.Equal(missingPublished.FetchedAt, result[0].PublishedAt);
            Assert.Equal("a-1", result[1].Id);
            Assert.Equal(olderPublished.PublishedAt, result[1].PublishedAt);
        }

        [Fact]
        public async Task GetAllArticlesAsync_MapsFeedTitleFromOwningFeed()
        {
            var userId = Guid.NewGuid();
            var feed = new Feed { Id = Guid.NewGuid(), UserId = userId, Title = "Sample Feed" };
            var article = new Article
            {
                Id = "a-1",
                FeedId = feed.Id,
                Title = "Article",
                Link = "https://example.com/article",
                Summary = "summary",
                PublishedAt = new DateTimeOffset(2024, 2, 1, 8, 0, 0, TimeSpan.Zero),
                FetchedAt = new DateTimeOffset(2024, 2, 1, 8, 1, 0, TimeSpan.Zero)
            };

            var service = new ArticleService(new FakeFeedRepository(new[] { feed }, new[] { article }), CreateInMemoryContextFactory());

            var result = await service.GetAllArticlesAsync(userId);

            Assert.Single(result);
            Assert.Equal("Sample Feed", result[0].FeedTitle);
        }

        private sealed class FakeFeedRepository : IFeedRepository
        {
            private readonly List<Feed> _feeds;
            private readonly List<Article> _articles;

            public FakeFeedRepository(IEnumerable<Feed> feeds, IEnumerable<Article> articles)
            {
                _feeds = feeds.Select(CloneFeed).ToList();
                _articles = articles.Select(CloneArticle).ToList();
            }

            public Task<List<Feed>> GetAllFeedsAsync(Guid userId)
            {
                return Task.FromResult(_feeds.Where(f => f.UserId == userId).Select(CloneFeed).ToList());
            }

            public Task<Feed?> GetFeedByIdAsync(Guid id, Guid userId)
            {
                var feed = _feeds.FirstOrDefault(f => f.Id == id && f.UserId == userId);
                return Task.FromResult(feed == null ? null : CloneFeed(feed));
            }

            public Task AddFeedAsync(Feed feed) => throw new NotSupportedException();

            public Task AddFeedWithArticlesAsync(Feed feed) => throw new NotSupportedException();

            public Task RemoveFeedAsync(Guid id, Guid userId) => throw new NotSupportedException();

            public Task UpdateFeedAsync(Feed feed) => throw new NotSupportedException();

            public Task<List<Article>> GetArticlesByFeedIdAsync(Guid feedId)
            {
                return Task.FromResult(_articles.Where(a => a.FeedId == feedId).Select(CloneArticle).ToList());
            }

            public Task<List<Article>> GetAllArticlesAsync(Guid userId)
            {
                var ownedFeedIds = _feeds.Where(f => f.UserId == userId).Select(f => f.Id).ToHashSet();
                return Task.FromResult(_articles.Where(a => ownedFeedIds.Contains(a.FeedId)).Select(CloneArticle).ToList());
            }

            public Task AddArticlesAsync(Guid feedId, List<Article> newArticles) => throw new NotSupportedException();

            private static Feed CloneFeed(Feed feed)
            {
                return new Feed
                {
                    Id = feed.Id,
                    UserId = feed.UserId,
                    Url = feed.Url,
                    Title = feed.Title,
                    SiteUrl = feed.SiteUrl,
                    AddedAt = feed.AddedAt,
                    LastRefreshedAt = feed.LastRefreshedAt,
                    LastRefreshStatus = feed.LastRefreshStatus,
                    Articles = feed.Articles.Select(CloneArticle).ToList()
                };
            }

            private static Article CloneArticle(Article article)
            {
                return new Article
                {
                    Id = article.Id,
                    FeedId = article.FeedId,
                    Title = article.Title,
                    Link = article.Link,
                    Summary = article.Summary,
                    PublishedAt = article.PublishedAt,
                    FetchedAt = article.FetchedAt
                };
            }
        }
    }
}