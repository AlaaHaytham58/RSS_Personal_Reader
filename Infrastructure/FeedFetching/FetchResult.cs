namespace Infrastructure.FeedFetching
{
    public class FetchResult
    {
        public bool IsSuccess { get; set; }
        public string? RawContent { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
