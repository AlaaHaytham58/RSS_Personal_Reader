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
    // sidebar category group. No external API/key involved. Kept intentionally large
    // (several dozen per major category) so it doesn't run dry after a handful of
    // subscriptions - for anything not covered here, FeedService.SearchFeedsAsync also
    // supports live autodiscovery of any website's own feeds on demand.
    public static class FeedSuggestions
    {
        public static readonly IReadOnlyList<FeedSuggestion> All = new List<FeedSuggestion>
        {
            new() { Category = "Technology", Title = "TechCrunch", Url = "https://techcrunch.com/feed/", SiteUrl = "https://techcrunch.com" },
            new() { Category = "Technology", Title = "The Verge", Url = "https://www.theverge.com/rss/index.xml", SiteUrl = "https://www.theverge.com" },
            new() { Category = "Technology", Title = "Wired", Url = "https://www.wired.com/feed/rss", SiteUrl = "https://www.wired.com" },
            new() { Category = "Technology", Title = "Ars Technica", Url = "https://feeds.arstechnica.com/arstechnica/index", SiteUrl = "https://arstechnica.com" },
            new() { Category = "Technology", Title = "Engadget", Url = "https://www.engadget.com/rss.xml", SiteUrl = "https://www.engadget.com" },
            new() { Category = "Technology", Title = "Gizmodo", Url = "https://gizmodo.com/rss", SiteUrl = "https://gizmodo.com" },
            new() { Category = "Technology", Title = "TechRadar", Url = "https://www.techradar.com/rss", SiteUrl = "https://www.techradar.com" },
            new() { Category = "Technology", Title = "ZDNET", Url = "https://www.zdnet.com/news/rss.xml", SiteUrl = "https://www.zdnet.com" },
            new() { Category = "Technology", Title = "CNET", Url = "https://www.cnet.com/rss/news/", SiteUrl = "https://www.cnet.com" },
            new() { Category = "Technology", Title = "VentureBeat", Url = "https://venturebeat.com/feed/", SiteUrl = "https://venturebeat.com" },
            new() { Category = "Technology", Title = "The Next Web", Url = "https://thenextweb.com/feed", SiteUrl = "https://thenextweb.com" },

            new() { Category = "Sports", Title = "ESPN", Url = "https://www.espn.com/espn/rss/news", SiteUrl = "https://www.espn.com" },
            new() { Category = "Sports", Title = "BBC Sport", Url = "https://feeds.bbci.co.uk/sport/rss.xml", SiteUrl = "https://www.bbc.co.uk/sport" },
            new() { Category = "Sports", Title = "Sky Sports", Url = "https://www.skysports.com/rss/12040", SiteUrl = "https://www.skysports.com" },
            new() { Category = "Sports", Title = "Yahoo Sports", Url = "https://sports.yahoo.com/rss/", SiteUrl = "https://sports.yahoo.com" },
            new() { Category = "Sports", Title = "CBS Sports", Url = "https://www.cbssports.com/rss/headlines/", SiteUrl = "https://www.cbssports.com" },
            new() { Category = "Sports", Title = "Bleacher Report", Url = "https://bleacherreport.com/articles/feed", SiteUrl = "https://bleacherreport.com" },

            new() { Category = "Business", Title = "CNBC", Url = "https://www.cnbc.com/id/100003114/device/rss/rss.html", SiteUrl = "https://www.cnbc.com" },
            new() { Category = "Business", Title = "Financial Times", Url = "https://www.ft.com/rss/home", SiteUrl = "https://www.ft.com" },
            new() { Category = "Business", Title = "Forbes", Url = "https://www.forbes.com/business/feed/", SiteUrl = "https://www.forbes.com" },
            new() { Category = "Business", Title = "Business Insider", Url = "https://www.businessinsider.com/rss", SiteUrl = "https://www.businessinsider.com" },
            new() { Category = "Business", Title = "MarketWatch", Url = "https://www.marketwatch.com/rss/topstories", SiteUrl = "https://www.marketwatch.com" },
            new() { Category = "Business", Title = "Reuters Business", Url = "https://feeds.reuters.com/reuters/businessNews", SiteUrl = "https://www.reuters.com" },

            new() { Category = "Entertainment", Title = "Variety", Url = "https://variety.com/feed/", SiteUrl = "https://variety.com" },
            new() { Category = "Entertainment", Title = "The Hollywood Reporter", Url = "https://www.hollywoodreporter.com/feed/", SiteUrl = "https://www.hollywoodreporter.com" },
            new() { Category = "Entertainment", Title = "Rolling Stone", Url = "https://www.rollingstone.com/feed/", SiteUrl = "https://www.rollingstone.com" },
            new() { Category = "Entertainment", Title = "Entertainment Weekly", Url = "https://ew.com/feed/", SiteUrl = "https://ew.com" },
            new() { Category = "Entertainment", Title = "Deadline", Url = "https://deadline.com/feed/", SiteUrl = "https://deadline.com" },
            new() { Category = "Entertainment", Title = "IGN", Url = "https://feeds.ign.com/ign/all", SiteUrl = "https://www.ign.com" },

            new() { Category = "Science", Title = "NASA Breaking News", Url = "https://www.nasa.gov/rss/dyn/breaking_news.rss", SiteUrl = "https://www.nasa.gov" },
            new() { Category = "Science", Title = "ScienceDaily", Url = "https://www.sciencedaily.com/rss/all.xml", SiteUrl = "https://www.sciencedaily.com" },
            new() { Category = "Science", Title = "Live Science", Url = "https://www.livescience.com/feeds/all", SiteUrl = "https://www.livescience.com" },
            new() { Category = "Science", Title = "New Scientist", Url = "https://www.newscientist.com/feed/home/", SiteUrl = "https://www.newscientist.com" },
            new() { Category = "Science", Title = "Phys.org", Url = "https://phys.org/rss-feed/", SiteUrl = "https://phys.org" },
            new() { Category = "Science", Title = "Scientific American", Url = "https://rss.sciam.com/ScientificAmerican-Global", SiteUrl = "https://www.scientificamerican.com" },

            new() { Category = "Health", Title = "Medical News Today", Url = "https://www.medicalnewstoday.com/rss", SiteUrl = "https://www.medicalnewstoday.com" },
            new() { Category = "Health", Title = "NPR Health", Url = "https://feeds.npr.org/1128/rss.xml", SiteUrl = "https://www.npr.org/sections/health" },
            new() { Category = "Health", Title = "Healthline", Url = "https://www.healthline.com/rss", SiteUrl = "https://www.healthline.com" },

            new() { Category = "Politics", Title = "Politico", Url = "https://www.politico.com/rss/politicopicks.xml", SiteUrl = "https://www.politico.com" },
            new() { Category = "Politics", Title = "The Hill", Url = "https://thehill.com/rss/syndicator/19110", SiteUrl = "https://thehill.com" },
            new() { Category = "Politics", Title = "NPR Politics", Url = "https://feeds.npr.org/1014/rss.xml", SiteUrl = "https://www.npr.org/sections/politics" },

            new() { Category = "Environment", Title = "The Guardian: Environment", Url = "https://www.theguardian.com/environment/rss", SiteUrl = "https://www.theguardian.com/environment" },
            new() { Category = "Environment", Title = "Grist", Url = "https://grist.org/feed/", SiteUrl = "https://grist.org" },
            new() { Category = "Environment", Title = "Yale Environment 360", Url = "https://e360.yale.edu/feed.xml", SiteUrl = "https://e360.yale.edu" },

            new() { Category = "World", Title = "BBC News", Url = "https://feeds.bbci.co.uk/news/rss.xml", SiteUrl = "https://www.bbc.co.uk/news" },
            new() { Category = "World", Title = "Reuters World News", Url = "https://feeds.reuters.com/Reuters/worldNews", SiteUrl = "https://www.reuters.com" },
            new() { Category = "World", Title = "Al Jazeera", Url = "https://www.aljazeera.com/xml/rss/all.xml", SiteUrl = "https://www.aljazeera.com" },
            new() { Category = "World", Title = "NPR World News", Url = "https://feeds.npr.org/1004/rss.xml", SiteUrl = "https://www.npr.org/sections/world" },

            new() { Category = "General", Title = "NPR News", Url = "https://feeds.npr.org/1001/rss.xml", SiteUrl = "https://www.npr.org" },
            new() { Category = "General", Title = "Reuters Top News", Url = "https://feeds.reuters.com/reuters/topNews", SiteUrl = "https://www.reuters.com" },
            new() { Category = "General", Title = "Axios", Url = "https://api.axios.com/feed/", SiteUrl = "https://www.axios.com" },

            new() { Category = "Media", Title = "Nieman Lab", Url = "https://www.niemanlab.org/feed/", SiteUrl = "https://www.niemanlab.org" },
            new() { Category = "Media", Title = "Poynter", Url = "https://www.poynter.org/feed/", SiteUrl = "https://www.poynter.org" },
        };
    }
}
