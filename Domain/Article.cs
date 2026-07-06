using System;

namespace Domain
{
    public class Article
    {
        // Article.Id is a string per spec (feed guid, link, or fallback hash)
        public string Id { get; set; } = string.Empty;
        public Guid FeedId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public DateTimeOffset PublishedAt { get; set; }
        public DateTimeOffset FetchedAt { get; set; }
    }
}
