using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Domain;
using Infrastructure.FeedFetching;
using Infrastructure.FeedParsing;
using Infrastructure.Storage;

namespace Services
{
    public class FeedService : IFeedService
    {
        private readonly IFeedRepository _repo;
        private readonly IFeedFetcher _fetcher;
        private readonly IFeedParser _parser;
        private readonly IFeedValidationService _validator;
        private readonly ICategoryService _categoryService;

        public FeedService(IFeedRepository repo, IFeedFetcher fetcher, IFeedParser parser, IFeedValidationService validator, ICategoryService categoryService)
        {
            _repo = repo;
            _fetcher = fetcher;
            _parser = parser;
            _validator = validator;
            _categoryService = categoryService;
        }

        public async Task<AddFeedOutcome> AddFeedAsync(Guid userId, string url)
        {
            // 1. Validate URL syntax
            if (!Validation.FeedUrlValidator.IsValid(url)) return new AddFeedInvalidUrl();

            // 2. Duplicate (scoped to this user's own feeds)
            var existing = await _repo.GetAllFeedsAsync(userId);
            if (existing.Exists(f => string.Equals(f.Url.TrimEnd('/'), url.TrimEnd('/'), StringComparison.OrdinalIgnoreCase)))
            {
                return new AddFeedAlreadyExists();
            }

            // 3. Fetch
            var fetchRes = await _fetcher.FetchAsync(url, System.Threading.CancellationToken.None);
            if (!fetchRes.IsSuccess) return new AddFeedUnreachable { Message = fetchRes.ErrorMessage ?? "Fetch failed" };

            // 4. Parse
            var parseRes = _parser.Parse(fetchRes.RawContent ?? string.Empty);
            if (!parseRes.IsSuccess) return new AddFeedNotAFeed { Message = parseRes.ErrorMessage ?? "Not a valid feed" };

            // 5. Construct feed
            var feed = new Feed
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Url = url,
                Title = parseRes.FeedTitle ?? url,
                SiteUrl = parseRes.SiteUrl,
                AddedAt = DateTimeOffset.UtcNow,
                LastRefreshedAt = DateTimeOffset.UtcNow,
                LastRefreshStatus = RefreshStatus.Success,
                Articles = parseRes.Articles.Select(a => {
                    a.FeedId = Guid.Empty; // will set below
                    return a;
                }).ToList()
            };

            // assign feed id to articles
            foreach (var a in feed.Articles) a.FeedId = feed.Id;

            // 5b. Best-effort auto-categorization from the feed's title/URL
            var guessedCategoryName = FeedCategoryClassifier.Guess(feed.Title, feed.Url, feed.SiteUrl);
            if (guessedCategoryName != null)
            {
                var categories = await _categoryService.GetAllAsync();
                var match = categories.FirstOrDefault(c => string.Equals(c.Name, guessedCategoryName, StringComparison.OrdinalIgnoreCase));
                if (match != null)
                {
                    feed.CategoryId = match.Id;
                }
            }

            // 6. Persist feed + articles in one atomic write
            await _repo.AddFeedWithArticlesAsync(feed);

            // 7. Return success
            return new AddFeedSuccess { Feed = feed };
        }

        public async Task<RefreshOutcome> RefreshFeedAsync(Guid userId, Guid feedId)
        {
            var feed = await _repo.GetFeedByIdAsync(feedId, userId);
            if (feed == null) return new RefreshNotFound { FeedId = feedId };

            var fetchRes = await _fetcher.FetchAsync(feed.Url, System.Threading.CancellationToken.None);
            if (!fetchRes.IsSuccess)
            {
                // mark feed failed
                feed.LastRefreshedAt = DateTimeOffset.UtcNow;
                feed.LastRefreshStatus = RefreshStatus.Failed;
                await _repo.UpdateFeedAsync(feed);
                return new RefreshFailed { FeedId = feedId, Message = fetchRes.ErrorMessage ?? "Fetch failed" };
            }

            var parseRes = _parser.Parse(fetchRes.RawContent ?? string.Empty);
            if (!parseRes.IsSuccess)
            {
                feed.LastRefreshedAt = DateTimeOffset.UtcNow;
                feed.LastRefreshStatus = RefreshStatus.Failed;
                await _repo.UpdateFeedAsync(feed);
                return new RefreshFailed { FeedId = feedId, Message = parseRes.ErrorMessage ?? "Parse failed" };
            }

            var articles = parseRes.Articles;
            foreach (var a in articles) a.FeedId = feed.Id;
            await _repo.AddArticlesAsync(feed.Id, articles);

            feed.LastRefreshedAt = DateTimeOffset.UtcNow;
            feed.LastRefreshStatus = RefreshStatus.Success;
            await _repo.UpdateFeedAsync(feed);

            return new RefreshSuccess { FeedId = feedId };
        }

        public async Task<bool> RemoveFeedAsync(Guid userId, Guid feedId)
        {
            var existing = await _repo.GetFeedByIdAsync(feedId, userId);
            if (existing == null) return false;
            await _repo.RemoveFeedAsync(feedId, userId);
            return true;
        }

        public Task<List<Feed>> GetAllFeedsAsync(Guid userId)
        {
            return _repo.GetAllFeedsAsync(userId);
        }
    }
}
