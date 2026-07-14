namespace Domain
{
    public class FavoriteArticle
    {
        public System.Guid FeedId { get; set; }
        public string ArticleId { get; set; } = string.Empty;
        public System.DateTimeOffset SavedAt { get; set; }
    }
}
