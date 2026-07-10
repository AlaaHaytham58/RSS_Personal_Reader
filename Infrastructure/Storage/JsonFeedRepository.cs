using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Domain;
using Microsoft.Extensions.Logging;
using Configuration;

namespace Infrastructure.Storage
{
    public class JsonFeedRepository : IFeedRepository
    {
        private readonly string _filePath;
        private readonly SemaphoreSlim _semaphore;
        private readonly ILogger<JsonFeedRepository> _logger;
        private readonly AppSettings _settings;

        // in-memory cache
        private List<Feed> _feeds = new List<Feed>();

        public JsonFeedRepository(AppSettings settings, SemaphoreSlim semaphore, ILogger<JsonFeedRepository> logger)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _semaphore = semaphore ?? throw new ArgumentNullException(nameof(semaphore));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _filePath = settings.DataFilePath ?? "data/feeds.json";

            EnsureLoaded();
        }

        private void EnsureLoaded()
        {
            try
            {
                if (!File.Exists(_filePath))
                {
                    _feeds = new List<Feed>();
                    PersistSync();
                    return;
                }

                var text = File.ReadAllText(_filePath);
                using var doc = JsonDocument.Parse(text);
                // Basic shape validation
                if (!doc.RootElement.TryGetProperty("feeds", out var feedsElement))
                {
                    _logger.LogWarning("feeds.json missing 'feeds' element; starting empty");
                    _feeds = new List<Feed>();
                    PersistSync();
                    return;
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var wrapper = JsonSerializer.Deserialize<FeedsFileWrapper>(text, options);
                _feeds = wrapper?.Feeds ?? new List<Feed>();
            }
            catch (Exception ex)
            {
                try
                {
                    var ts = DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmss");
                    var backup = _filePath + $".corrupted.{ts}";
                    File.Copy(_filePath, backup, true);
                    _logger.LogError(ex, "Failed to parse feeds.json; backed up to {Backup}", backup);
                }
                catch (Exception e2)
                {
                    _logger.LogError(e2, "Failed to backup corrupted feeds.json");
                }

                _feeds = new List<Feed>();
                PersistSync();
            }
        }

        private void PersistSync()
        {
            var tmp = _filePath + ".tmp";
            var wrapper = new FeedsFileWrapper { SchemaVersion = 1, Feeds = _feeds };
            var options = new JsonSerializerOptions { WriteIndented = true };
            var text = JsonSerializer.Serialize(wrapper, options);
            File.WriteAllText(tmp, text);

            try
            {
                if (File.Exists(_filePath))
                {
                    // Replace atomically
                    File.Replace(tmp, _filePath, null);
                }
                else
                {
                    File.Move(tmp, _filePath);
                }
            }
            catch (PlatformNotSupportedException)
            {
                // fallback
                if (File.Exists(_filePath)) File.Delete(_filePath);
                File.Move(tmp, _filePath);
            }
        }

        private async Task PersistAsync()
        {
            var tmp = _filePath + ".tmp";
            var wrapper = new FeedsFileWrapper { SchemaVersion = 1, Feeds = _feeds };
            var options = new JsonSerializerOptions { WriteIndented = true };
            var text = JsonSerializer.Serialize(wrapper, options);
            await File.WriteAllTextAsync(tmp, text);

            try
            {
                if (File.Exists(_filePath))
                {
                    File.Replace(tmp, _filePath, null);
                }
                else
                {
                    File.Move(tmp, _filePath);
                }
            }
            catch (PlatformNotSupportedException)
            {
                if (File.Exists(_filePath)) File.Delete(_filePath);
                File.Move(tmp, _filePath);
            }
        }

        public Task<List<Feed>> GetAllFeedsAsync()
        {
            // return a copy to avoid external mutations
            var copy = _feeds.Select(f => CloneFeed(f)).ToList();
            return Task.FromResult(copy);
        }

        public Task<Feed?> GetFeedByIdAsync(Guid id)
        {
            var found = _feeds.FirstOrDefault(f => f.Id == id);
            return Task.FromResult(found == null ? null : CloneFeed(found));
        }

        [System.Obsolete("Use AddFeedWithArticlesAsync for atomic writes", false)]
        public async Task AddFeedAsync(Feed feed)
        {
            if (feed == null) throw new ArgumentNullException(nameof(feed));

            // Delegate to the atomic add that includes articles to avoid code duplication
            await AddFeedWithArticlesAsync(feed);
        }

        // New API: persist feed and its initial articles together atomically
        public async Task AddFeedWithArticlesAsync(Feed feed)
        {
            if (feed == null) throw new ArgumentNullException(nameof(feed));

            await _semaphore.WaitAsync();
            try
            {
                // ensure no duplicate id
                if (_feeds.Any(f => f.Id == feed.Id))
                {
                    _logger.LogWarning("Feed with id {FeedId} already exists, skipping add", feed.Id);
                    return;
                }

                // Deep clone incoming feed to internal storage to avoid external mutations
                var stored = CloneFeed(feed);
                _feeds.Add(stored);
                await Task.Run(() => PersistSync());
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public async Task RemoveFeedAsync(Guid id)
        {
            await _semaphore.WaitAsync();
            try
            {
                _feeds.RemoveAll(f => f.Id == id);
                await Task.Run(() => PersistSync());
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
                var idx = _feeds.FindIndex(f => f.Id == feed.Id);
                if (idx >= 0) _feeds[idx] = feed;
                else _feeds.Add(feed);
                await Task.Run(() => PersistSync());
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public Task<List<Article>> GetArticlesByFeedIdAsync(Guid feedId)
        {
            var feed = _feeds.FirstOrDefault(f => f.Id == feedId);
            if (feed == null) return Task.FromResult(new List<Article>());
            var copy = feed.Articles.Select(a => CloneArticle(a)).ToList();
            return Task.FromResult(copy);
        }

        public Task<List<Article>> GetAllArticlesAsync()
        {
            var all = _feeds.SelectMany(f => f.Articles).Select(a => CloneArticle(a)).ToList();
            return Task.FromResult(all);
        }

        public async Task AddArticlesAsync(Guid feedId, List<Article> newArticles)
        {
            if (newArticles == null) throw new ArgumentNullException(nameof(newArticles));

            await _semaphore.WaitAsync();
            try
            {
                var feed = _feeds.FirstOrDefault(f => f.Id == feedId);
                if (feed == null)
                {
                    _logger.LogWarning("Attempted to add articles to non-existent feed {FeedId}", feedId);
                    return;
                }

                // dedupe by Id
                var existingIds = new HashSet<string>(feed.Articles.Select(a => a.Id));
                var toAdd = newArticles.Where(a => !existingIds.Contains(a.Id)).ToList();
                if (toAdd.Count == 0) return;

                feed.Articles.AddRange(toAdd);

                // enforce cap
                var ordered = feed.Articles.OrderByDescending(a => a.PublishedAt).Take(_settings.MaxArticlesPerFeed).ToList();
                feed.Articles = ordered;

                await Task.Run(() => PersistSync());
            }
            finally
            {
                _semaphore.Release();
            }
        }

        private static Feed CloneFeed(Feed f)
        {
            return new Feed
            {
                Id = f.Id,
                Url = f.Url,
                Title = f.Title,
                SiteUrl = f.SiteUrl,
                AddedAt = f.AddedAt,
                LastRefreshedAt = f.LastRefreshedAt,
                LastRefreshStatus = f.LastRefreshStatus,
                Articles = f.Articles.Select(a => CloneArticle(a)).ToList()
            };
        }

        private static Article CloneArticle(Article a)
        {
            return new Article
            {
                Id = a.Id,
                FeedId = a.FeedId,
                Title = a.Title,
                Link = a.Link,
                Summary = a.Summary,
                PublishedAt = a.PublishedAt,
                FetchedAt = a.FetchedAt,
                ImageUrl = a.ImageUrl
            };
        }

        private class FeedsFileWrapper
        {
            public int SchemaVersion { get; set; }
            public List<Feed> Feeds { get; set; } = new List<Feed>();
        }
    }
}
