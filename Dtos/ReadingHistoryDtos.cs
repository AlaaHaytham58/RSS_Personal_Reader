using System;

namespace Dtos
{
    public class MarkReadRequest
    {
        public Guid FeedId { get; set; }
        public string ArticleId { get; set; } = string.Empty;
    }

    public class SetFavoriteRequest
    {
        public Guid FeedId { get; set; }
        public string ArticleId { get; set; } = string.Empty;
        public bool IsFavorite { get; set; }
    }
}
