namespace Domain
{
    public class ReadArticle
    {
        public System.Guid FeedId { get; set; }
        public string ArticleId { get; set; } = string.Empty;
        public System.DateTimeOffset ReadAt { get; set; }
    }
}
