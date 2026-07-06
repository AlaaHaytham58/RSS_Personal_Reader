using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain;

namespace Infrastructure.Storage
{
    public interface IFeedRepository
    {
        Task<List<Feed>> GetAllFeedsAsync();
        Task<Feed?> GetFeedByIdAsync(Guid id);
        [Obsolete("Use AddFeedWithArticlesAsync for atomic writes", false)]
        Task AddFeedAsync(Feed feed);
        // Adds a new feed along with its initial articles in a single atomic write.
        Task AddFeedWithArticlesAsync(Feed feed);
        Task RemoveFeedAsync(Guid id);
        Task UpdateFeedAsync(Feed feed);
        Task<List<Article>> GetArticlesByFeedIdAsync(Guid feedId);
        Task<List<Article>> GetAllArticlesAsync();
        Task AddArticlesAsync(Guid feedId, List<Article> newArticles);
    }
}
