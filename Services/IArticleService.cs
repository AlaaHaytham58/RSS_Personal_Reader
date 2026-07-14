using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IArticleService
    {
        Task<List<ArticleResponse>> GetAllArticlesAsync(Guid userId);
        Task<List<ArticleResponse>> GetHistoryAsync(Guid userId, int limit);
        Task<bool> MarkReadAsync(Guid userId, Guid feedId, string articleId);
        Task<bool> SetFavoriteAsync(Guid userId, Guid feedId, string articleId, bool isFavorite);
    }
}