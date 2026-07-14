using System;
using System.Collections.Generic;

namespace Domain
{
    public enum RefreshStatus
    {
        Unknown,
        Success,
        Failed
    }

    public class Feed
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? SiteUrl { get; set; }
        public DateTimeOffset AddedAt { get; set; }
        public DateTimeOffset? LastRefreshedAt { get; set; }
        public RefreshStatus LastRefreshStatus { get; set; } = RefreshStatus.Unknown;
        public Guid? CategoryId { get; set; }

        // Nested articles for JSON persistence
        public List<Article> Articles { get; set; } = new List<Article>();
    }
}
