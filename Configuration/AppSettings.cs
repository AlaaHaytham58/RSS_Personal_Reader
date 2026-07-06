namespace Configuration
{
    public class AppSettings
    {
        public string DataFilePath { get; set; } = "data/feeds.json";
        public int FeedFetchTimeoutSeconds { get; set; } = 10;
        public int MaxArticlesPerFeed { get; set; } = 50;
        public long MaxFeedSizeBytes { get; set; } = 1_000_000;
    }
}
