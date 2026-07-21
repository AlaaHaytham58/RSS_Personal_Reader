namespace Dtos
{
    public class FeedSuggestionResponse
    {
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? SiteUrl { get; set; }
        public string Category { get; set; } = string.Empty;
    }
}
