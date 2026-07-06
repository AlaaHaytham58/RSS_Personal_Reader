using System.Collections.Generic;
using Domain;

namespace Infrastructure.FeedParsing
{
    public class ParseResult
    {
        public bool IsSuccess { get; set; }
        public string? FeedTitle { get; set; }
        public string? SiteUrl { get; set; }
        public List<Article> Articles { get; set; } = new List<Article>();
        public string? ErrorMessage { get; set; }
    }
}
