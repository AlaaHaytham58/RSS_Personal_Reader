namespace Configuration
{
    public class AppSettings
    {
        public string DataFilePath { get; set; } = "data/feeds.json";
        public string SqliteConnectionString { get; set; } = "Data Source=data/reader.db";
        public int FeedFetchTimeoutSeconds { get; set; } = 10;
        public int MaxArticlesPerFeed { get; set; } = 50;
        public long MaxFeedSizeBytes { get; set; } = 1_000_000;
        public int SummaryCacheMinutes { get; set; } = 60;
        public DeepSeekSettings DeepSeek { get; set; } = new();
        public GoogleSettings Google { get; set; } = new();
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

    public class GoogleSettings
    {
        // Never commit real values here. Put GOOGLE_CLIENT_ID=... and
        // GOOGLE_CLIENT_SECRET=... in a local .env file (gitignored), or set the
        // AppSettings__Google__ClientId / AppSettings__Google__ClientSecret
        // environment variables directly in production (e.g. Railway).
        public string ClientId { get; set; } = "";
        public string ClientSecret { get; set; } = "";
    }
}
