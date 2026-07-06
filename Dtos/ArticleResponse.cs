using System;

namespace Dtos
{
    public class ArticleResponse
    {
        public string Id { get; set; } = string.Empty;
        public Guid FeedId { get; set; }
        public string FeedTitle { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public DateTimeOffset PublishedAt { get; set; }
    }
}
