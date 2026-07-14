using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IArticleService
    {
        Task<List<ArticleResponse>> GetAllArticlesAsync();
        Task<List<ArticleResponse>> GetHistoryAsync(int limit);
        Task<bool> MarkReadAsync(Guid feedId, string articleId);
        Task<bool> SetFavoriteAsync(Guid feedId, string articleId, bool isFavorite);
    }
}