using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Configuration;
using Domain;
using Dtos;
using Infrastructure.FeedFetching;
using Infrastructure.FeedParsing;
using Infrastructure.Storage;
using Microsoft.Extensions.Logging;

namespace Services
{
    public class FeedService : IFeedService
    {
        private readonly IFeedRepository _repo;
        private readonly IFeedFetcher _fetcher;
        private readonly IFeedParser _parser;
        private readonly IFeedValidationService _validator;
        private readonly ICategoryService _categoryService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AppSettings _settings;
        private readonly ILogger<FeedService> _logger;

        public FeedService(IFeedRepository repo, IFeedFetcher fetcher, IFeedParser parser, IFeedValidationService validator, ICategoryService categoryService, IHttpClientFactory httpClientFactory, AppSettings settings, ILogger<FeedService> logger)
        {
            _repo = repo;
            _fetcher = fetcher;
            _parser = parser;
            _validator = validator;
            _categoryService = categoryService;
            _httpClientFactory = httpClientFactory;
            _settings = settings;
            _logger = logger;
        }

        public async Task<AddFeedOutcome> AddFeedAsync(Guid userId, string url)
        {
            // 1. Validate URL syntax
            if (!Validation.FeedUrlValidator.IsValid(url)) return new AddFeedInvalidUrl();

            // 2. Duplicate (scoped to this user's own feeds)
            var normalizedUrl = UrlNormalizer.Normalize(url);
            var existing = await _repo.GetAllFeedsAsync(userId);
            if (existing.Exists(f => f.NormalizedUrl == normalizedUrl))
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
                NormalizedUrl = normalizedUrl,
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
            var added = await _repo.AddFeedWithArticlesAsync(feed);
            if (!added) return new AddFeedAlreadyExists();

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

        public async Task<List<FeedSuggestionResponse>> GetSuggestionsAsync(Guid userId)
        {
            var existing = await _repo.GetAllFeedsAsync(userId);
            var existingNormalized = existing.Select(f => f.NormalizedUrl).ToHashSet();

            var categories = await _categoryService.GetAllAsync();
            var categoryNameById = categories.ToDictionary(c => c.Id, c => c.Name);
            var userCategoryNames = existing
                .Where(f => f.CategoryId.HasValue && categoryNameById.ContainsKey(f.CategoryId!.Value))
                .Select(f => categoryNameById[f.CategoryId!.Value])
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            return FeedSuggestions.All
                .Where(s => !existingNormalized.Contains(UrlNormalizer.Normalize(s.Url)))
                .OrderByDescending(s => userCategoryNames.Contains(s.Category))
                .Select(s => new FeedSuggestionResponse { Title = s.Title, Url = s.Url, SiteUrl = s.SiteUrl, Category = s.Category })
                .ToList();
        }

        // Handles the "the curated list ran out" problem: a plain keyword filters the
        // static catalog, but anything that looks like a website is fetched live and its
        // own <link rel="alternate"> feed tags are discovered on the spot - an effectively
        // unlimited source of suggestions instead of a fixed pool that gets exhausted.
        public async Task<List<FeedSuggestionResponse>> SearchFeedsAsync(Guid userId, string query)
        {
            query = query?.Trim() ?? "";
            if (query.Length == 0) return new List<FeedSuggestionResponse>();

            var existing = await _repo.GetAllFeedsAsync(userId);
            var existingNormalized = existing.Select(f => f.NormalizedUrl).ToHashSet();

            var looksLikeSite = !query.Contains(' ') && query.Contains('.');
            if (looksLikeSite)
            {
                var discovered = await DiscoverFeedsFromSiteAsync(query);
                var filtered = discovered
                    .Where(s => !existingNormalized.Contains(UrlNormalizer.Normalize(s.Url)))
                    .ToList();
                if (filtered.Count > 0) return filtered;
                // Fall through to a keyword match below if the site had nothing discoverable.
            }

            var curated = FeedSuggestions.All
                .Where(s => !existingNormalized.Contains(UrlNormalizer.Normalize(s.Url)))
                .Where(s => s.Title.Contains(query, StringComparison.OrdinalIgnoreCase)
                    || s.Category.Contains(query, StringComparison.OrdinalIgnoreCase)
                    || s.Url.Contains(query, StringComparison.OrdinalIgnoreCase)
                    || (s.SiteUrl != null && s.SiteUrl.Contains(query, StringComparison.OrdinalIgnoreCase)))
                .Select(s => new FeedSuggestionResponse { Title = s.Title, Url = s.Url, SiteUrl = s.SiteUrl, Category = s.Category })
                .ToList();

            if (looksLikeSite) return curated;

            // Topic/keyword search: augment the (likely small) curated matches with feeds
            // discovered by searching the live web for the topic and running the same
            // <link rel="alternate"> autodiscovery against each result page.
            var web = await SearchWebForFeedsAsync(query);

            var merged = new List<FeedSuggestionResponse>();
            var seen = new HashSet<string>();
            foreach (var s in curated.Concat(web))
            {
                var normalized = UrlNormalizer.Normalize(s.Url);
                if (existingNormalized.Contains(normalized)) continue;
                if (!seen.Add(normalized)) continue;
                merged.Add(s);
            }

            return merged.Take(20).ToList();
        }

        // Searches the live web for the topic via Tavily, then reuses the existing
        // <link rel="alternate"> site-autodiscovery against each top result page —
        // this is how a fixed curated list stays supplemented with feeds we've never
        // heard of. Fails soft (empty list) if unconfigured or the call errors, since
        // topic search must still work off the curated list alone in that case.
        private async Task<List<FeedSuggestionResponse>> SearchWebForFeedsAsync(string query)
        {
            var apiKey = _settings.Tavily.ApiKey;
            if (string.IsNullOrWhiteSpace(apiKey)) return new List<FeedSuggestionResponse>();

            List<TavilyResult>? results;
            try
            {
                var client = _httpClientFactory.CreateClient("tavily");
                client.Timeout = TimeSpan.FromSeconds(_settings.Tavily.TimeoutSeconds);

                var payload = new TavilyRequest
                {
                    ApiKey = apiKey,
                    Query = query,
                    MaxResults = _settings.Tavily.MaxResults,
                };

                using var response = await client.PostAsJsonAsync(_settings.Tavily.ApiUrl, payload);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Tavily search failed with {StatusCode}", response.StatusCode);
                    return new List<FeedSuggestionResponse>();
                }

                var body = await response.Content.ReadFromJsonAsync<TavilyResponse>();
                results = body?.Results;
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                _logger.LogWarning(ex, "Tavily search errored");
                return new List<FeedSuggestionResponse>();
            }

            if (results == null || results.Count == 0) return new List<FeedSuggestionResponse>();

            var discoveryTasks = results
                .Where(r => !string.IsNullOrWhiteSpace(r.Url))
                .Select(r => DiscoverFeedsFromSiteAsync(r.Url!));

            var discoveredLists = await Task.WhenAll(discoveryTasks);

            var seen = new HashSet<string>();
            var merged = new List<FeedSuggestionResponse>();
            foreach (var list in discoveredLists)
            {
                foreach (var s in list)
                {
                    if (seen.Add(UrlNormalizer.Normalize(s.Url))) merged.Add(s);
                }
            }

            return merged;
        }

        private async Task<List<FeedSuggestionResponse>> DiscoverFeedsFromSiteAsync(string input)
        {
            var url = input;
            if (!url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) && !url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                url = "https://" + url;
            }
            if (!Uri.TryCreate(url, UriKind.Absolute, out var baseUri)) return new List<FeedSuggestionResponse>();

            var fetchRes = await _fetcher.FetchAsync(url, CancellationToken.None);
            if (!fetchRes.IsSuccess || string.IsNullOrEmpty(fetchRes.RawContent)) return new List<FeedSuggestionResponse>();

            var results = new List<FeedSuggestionResponse>();
            var seenUrls = new HashSet<string>();

            foreach (Match linkMatch in Regex.Matches(fetchRes.RawContent, "<link\\b[^>]*>", RegexOptions.IgnoreCase))
            {
                var tag = linkMatch.Value;
                if (!Regex.IsMatch(tag, "rel\\s*=\\s*[\"']alternate[\"']", RegexOptions.IgnoreCase)) continue;

                var typeMatch = Regex.Match(tag, "type\\s*=\\s*[\"']([^\"']+)[\"']", RegexOptions.IgnoreCase);
                if (!typeMatch.Success) continue;
                var type = typeMatch.Groups[1].Value;
                if (!type.Contains("rss", StringComparison.OrdinalIgnoreCase)
                    && !type.Contains("atom", StringComparison.OrdinalIgnoreCase)
                    && !type.Contains("xml", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var hrefMatch = Regex.Match(tag, "href\\s*=\\s*[\"']([^\"']+)[\"']", RegexOptions.IgnoreCase);
                if (!hrefMatch.Success) continue;
                var href = System.Net.WebUtility.HtmlDecode(hrefMatch.Groups[1].Value);
                if (!Uri.TryCreate(baseUri, href, out var feedUri)) continue;

                var feedUrl = feedUri.ToString();
                if (!seenUrls.Add(feedUrl)) continue;

                // MediaWiki sites (Wikipedia and the thousands of wikis built on the same
                // engine) advertise edit-history feeds (recent changes, page history,
                // watchlists, diffs) on every single page via /index.php?...&feed=.
                // These are all valid feeds but are about edits, not the page's topic -
                // never a useful subscription suggestion - so reject the whole family by
                // its URL shape rather than chasing each specific Special: page name.
                if (feedUri.AbsolutePath.Contains("index.php", StringComparison.OrdinalIgnoreCase)
                    && feedUri.Query.Contains("feed=", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var titleMatch = Regex.Match(tag, "title\\s*=\\s*[\"']([^\"']+)[\"']", RegexOptions.IgnoreCase);
                var title = titleMatch.Success ? System.Net.WebUtility.HtmlDecode(titleMatch.Groups[1].Value) : baseUri.Host;

                var category = FeedCategoryClassifier.Guess(title, feedUrl, url) ?? "Discovered";
                results.Add(new FeedSuggestionResponse { Title = title, Url = feedUrl, SiteUrl = url, Category = category });
            }

            return results;
        }

        private class TavilyRequest
        {
            [JsonPropertyName("api_key")]
            public string ApiKey { get; set; } = "";

            [JsonPropertyName("query")]
            public string Query { get; set; } = "";

            [JsonPropertyName("max_results")]
            public int MaxResults { get; set; } = 6;

            [JsonPropertyName("include_answer")]
            public bool IncludeAnswer { get; set; } = false;
        }

        private class TavilyResponse
        {
            [JsonPropertyName("results")]
            public List<TavilyResult>? Results { get; set; }
        }

        private class TavilyResult
        {
            [JsonPropertyName("url")]
            public string? Url { get; set; }
        }
    }
}
