using System;
using System.Collections.Generic;
using System.Linq;

namespace Services
{
    /// <summary>
    /// Guesses a default category for a newly added feed from its title/URL, using simple
    /// keyword matching against the built-in category names. Returns null (uncategorized)
    /// when nothing matches confidently - the user can always assign one manually.
    /// </summary>
    public static class FeedCategoryClassifier
    {
        private static readonly Dictionary<string, string[]> KeywordsByCategory = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Technology"] = new[] { "tech", "verge", "wired", "engadget", "techcrunch", "ars technica", "gadget" },
            ["Sports"] = new[] { "sport", "espn", "football", "soccer", "basketball", "nba", "nfl", "cricket", "tennis" },
            ["Politics"] = new[] { "politic", "politico", "election", "senate", "congress", "parliament" },
            ["Business"] = new[] { "business", "cnbc", "bloomberg", "finance", "market", "economy", "econom" },
            ["Entertainment"] = new[] { "entertainment", "variety", "hollywood", "celebrity", "movie", "film", "music" },
            ["Science"] = new[] { "science", "nasa", "space", "research" },
            ["Health"] = new[] { "health", "medical", "medicine", "wellness" },
            ["Environment"] = new[] { "environment", "climate", "wildlife", "sustainability" },
            ["World"] = new[] { "world", "international", "global" },
        };

        public static string? Guess(string? title, string? url, string? siteUrl)
        {
            var haystack = string.Join(' ', title, url, siteUrl).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(haystack))
            {
                return null;
            }

            foreach (var (categoryName, keywords) in KeywordsByCategory)
            {
                if (keywords.Any(keyword => haystack.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
                {
                    return categoryName;
                }
            }

            return null;
        }
    }
}
