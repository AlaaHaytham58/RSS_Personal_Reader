namespace Domain
{
    // Singleton row (Id is always 1) caching the last generated daily digest.
    public class DailySummary
    {
        public int Id { get; set; } = 1;
        public string Content { get; set; } = string.Empty;
        public System.DateTimeOffset GeneratedAt { get; set; }
    }
}
