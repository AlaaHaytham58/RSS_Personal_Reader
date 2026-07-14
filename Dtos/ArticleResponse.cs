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

        /// <summary>
        /// URL of an image associated with the article, if available.
        /// </summary>
        public string? ImageUrl { get; set; }
        public bool IsRead { get; set; }
        public bool IsFavorite { get; set; }
    }
}

