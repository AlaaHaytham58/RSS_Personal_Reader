using System.Collections.Generic;

namespace Services
{
    public class FeedSuggestion
    {
        public string Category { get; set; } = "";
        public string Title { get; set; } = "";
        public string Url { get; set; } = "";
        public string? SiteUrl { get; set; }
    }

    // Always-available curated directory for "Explore feeds" - category names match
    // FeedCategoryClassifier's keys so a subscribed suggestion lands in the matching
    // sidebar category group. No external API/key involved.
    public static class FeedSuggestions
    {
        public static readonly IReadOnlyList<FeedSuggestion> All = new List<FeedSuggestion>
        {
            new() { Category = "Technology", Title = "TechCrunch", Url = "https://techcrunch.com/feed/", SiteUrl = "https://techcrunch.com" },
            new() { Category = "Technology", Title = "The Verge", Url = "https://www.theverge.com/rss/index.xml", SiteUrl = "https://www.theverge.com" },
            new() { Category = "Technology", Title = "Wired", Url = "https://www.wired.com/feed/rss", SiteUrl = "https://www.wired.com" },
            new() { Category = "Technology", Title = "Ars Technica", Url = "https://feeds.arstechnica.com/arstechnica/index", SiteUrl = "https://arstechnica.com" },

            new() { Category = "Sports", Title = "ESPN", Url = "https://www.espn.com/espn/rss/news", SiteUrl = "https://www.espn.com" },
            new() { Category = "Sports", Title = "BBC Sport", Url = "https://feeds.bbci.co.uk/sport/rss.xml", SiteUrl = "https://www.bbc.co.uk/sport" },

            new() { Category = "Business", Title = "CNBC", Url = "https://www.cnbc.com/id/100003114/device/rss/rss.html", SiteUrl = "https://www.cnbc.com" },
            new() { Category = "Business", Title = "Financial Times", Url = "https://www.ft.com/rss/home", SiteUrl = "https://www.ft.com" },

            new() { Category = "Entertainment", Title = "Variety", Url = "https://variety.com/feed/", SiteUrl = "https://variety.com" },
            new() { Category = "Entertainment", Title = "The Hollywood Reporter", Url = "https://www.hollywoodreporter.com/feed/", SiteUrl = "https://www.hollywoodreporter.com" },

            new() { Category = "Science", Title = "NASA Breaking News", Url = "https://www.nasa.gov/rss/dyn/breaking_news.rss", SiteUrl = "https://www.nasa.gov" },
            new() { Category = "Science", Title = "ScienceDaily", Url = "https://www.sciencedaily.com/rss/all.xml", SiteUrl = "https://www.sciencedaily.com" },

            new() { Category = "Health", Title = "Medical News Today", Url = "https://www.medicalnewstoday.com/rss", SiteUrl = "https://www.medicalnewstoday.com" },

            new() { Category = "Politics", Title = "Politico", Url = "https://www.politico.com/rss/politicopicks.xml", SiteUrl = "https://www.politico.com" },

            new() { Category = "Environment", Title = "The Guardian: Environment", Url = "https://www.theguardian.com/environment/rss", SiteUrl = "https://www.theguardian.com/environment" },

            new() { Category = "World", Title = "BBC News", Url = "https://feeds.bbci.co.uk/news/rss.xml", SiteUrl = "https://www.bbc.co.uk/news" },
            new() { Category = "World", Title = "Reuters World News", Url = "https://feeds.reuters.com/Reuters/worldNews", SiteUrl = "https://www.reuters.com" },
        };
    }
}
