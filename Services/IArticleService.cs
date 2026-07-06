using System.Collections.Generic;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IArticleService
    {
        Task<List<ArticleResponse>> GetAllArticlesAsync();
    }
}