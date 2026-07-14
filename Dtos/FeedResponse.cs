using System;

namespace Dtos
{
    public class FeedResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? SiteUrl { get; set; }
        public DateTimeOffset? LastRefreshedAt { get; set; }
        public string LastRefreshStatus { get; set; } = "Unknown";
        public int ArticleCount { get; set; }
        public Guid? CategoryId { get; set; }
    }
}
