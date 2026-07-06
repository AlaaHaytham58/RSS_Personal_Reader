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

        public FeedService(IFeedRepository repo, IFeedFetcher fetcher, IFeedParser parser, IFeedValidationService validator)
        {
            _repo = repo;
            _fetcher = fetcher;
            _parser = parser;
            _validator = validator;
        }

        public async Task<AddFeedOutcome> AddFeedAsync(string url)
        {
            // 1. Validate URL syntax
            if (!Validation.FeedUrlValidator.IsValid(url)) return new AddFeedInvalidUrl();

            // 2. Duplicate
            var existing = await _repo.GetAllFeedsAsync();
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

            // 6. Persist feed + articles in one atomic write
            await _repo.AddFeedWithArticlesAsync(feed);

            // 7. Return success
            return new AddFeedSuccess { Feed = feed };
        }

        public async Task<RefreshOutcome> RefreshFeedAsync(Guid feedId)
        {
            var feed = await _repo.GetFeedByIdAsync(feedId);
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

        public async Task<bool> RemoveFeedAsync(Guid feedId)
        {
            var existing = await _repo.GetFeedByIdAsync(feedId);
            if (existing == null) return false;
            await _repo.RemoveFeedAsync(feedId);
            return true;
        }

        public Task<List<Feed>> GetAllFeedsAsync()
        {
            return _repo.GetAllFeedsAsync();
        }
    }
}
