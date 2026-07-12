namespace Configuration
{
    public class AppSettings
    {
        public string DataFilePath { get; set; } = "data/feeds.json";
        public int FeedFetchTimeoutSeconds { get; set; } = 10;
        public int MaxArticlesPerFeed { get; set; } = 50;
        public long MaxFeedSizeBytes { get; set; } = 1_000_000;
        public DeepSeekSettings DeepSeek { get; set; } = new();
    }

    public class DeepSeekSettings
    {
        // Never commit a real key here. Put DEEPSEEK_API_KEY=... in a local .env
        // file (gitignored, see .env.example), or set the AppSettings__DeepSeek__ApiKey
        // environment variable directly in production (e.g. Railway).
        public string ApiKey { get; set; } = "";
        public string ApiUrl { get; set; } = "https://api.deepseek.com/chat/completions";
        public string Model { get; set; } = "deepseek-chat";
        public int TimeoutSeconds { get; set; } = 30;
    }
}
