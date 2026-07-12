using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dtos;
using Infrastructure.Storage;

namespace Services
{
    public class ArticleService : IArticleService
    {
        private readonly IFeedRepository _repository;

        public ArticleService(IFeedRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<List<ArticleResponse>> GetAllArticlesAsync()
        {
            var feeds = await _repository.GetAllFeedsAsync();
            var articles = await _repository.GetAllArticlesAsync();

            return articles
                .OrderByDescending(GetSortTimestamp)
                .Select(article =>
                {
                                        var feed = feeds.FirstOrDefault(f => f.Id == article.FeedId);
                    return new ArticleResponse
                    {
                        Id = article.Id,
                        FeedId = article.FeedId,
                        FeedTitle = feed?.Title ?? string.Empty,
                        Title = article.Title,
                        Link = article.Link,
                        Summary = article.Summary,
                        PublishedAt = GetSortTimestamp(article),
                        ImageUrl = article.ImageUrl
                    };
                })
                .ToList();
        }

        private static DateTimeOffset GetSortTimestamp(Domain.Article article)
        {
            return article.PublishedAt == default ? article.FetchedAt : article.PublishedAt;
        }
    }
}