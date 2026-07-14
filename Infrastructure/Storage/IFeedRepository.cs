using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain;

namespace Infrastructure.Storage
{
    public interface IFeedRepository
    {
        Task<List<Feed>> GetAllFeedsAsync(Guid userId);
        Task<Feed?> GetFeedByIdAsync(Guid id, Guid userId);
        [Obsolete("Use AddFeedWithArticlesAsync for atomic writes", false)]
        Task AddFeedAsync(Feed feed);
        // Adds a new feed along with its initial articles in a single atomic write.
        Task AddFeedWithArticlesAsync(Feed feed);
        Task RemoveFeedAsync(Guid id, Guid userId);
        Task UpdateFeedAsync(Feed feed);
        Task<List<Article>> GetArticlesByFeedIdAsync(Guid feedId);
        Task<List<Article>> GetAllArticlesAsync(Guid userId);
        Task AddArticlesAsync(Guid feedId, List<Article> newArticles);
    }
}
