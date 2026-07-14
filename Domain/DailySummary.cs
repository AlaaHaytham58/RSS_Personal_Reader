namespace Domain
{
    // One cached daily digest per user, keyed by UserId.
    public class DailySummary
    {
        public System.Guid UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public System.DateTimeOffset GeneratedAt { get; set; }
    }
}
