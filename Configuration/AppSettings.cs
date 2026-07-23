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
        public TavilySettings Tavily { get; set; } = new();
        public SmtpSettings Smtp { get; set; } = new();
    }

    public class SmtpSettings
    {
        // Never commit real values here. Put SMTP_HOST / SMTP_PORT / SMTP_USER /
        // SMTP_PASSWORD / SMTP_FROM in a local .env file (gitignored), or set the
        // AppSettings__Smtp__* environment variables directly in production (e.g. Railway).
        public string Host { get; set; } = "";
        public int Port { get; set; } = 587;
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public string FromAddress { get; set; } = "";
        public string FromName { get; set; } = "RSS Reader";
        public bool EnableSsl { get; set; } = true;
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

    public class TavilySettings
    {
        // Never commit a real key here. Put TAVILY_API_KEY=... in a local .env
        // file (gitignored), or set the AppSettings__Tavily__ApiKey environment
        // variable directly in production (e.g. Railway).
        public string ApiKey { get; set; } = "";
        public string ApiUrl { get; set; } = "https://api.tavily.com/search";
        public int TimeoutSeconds { get; set; } = 10;
        public int MaxResults { get; set; } = 6;
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
