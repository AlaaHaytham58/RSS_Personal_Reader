using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Services;

namespace Endpoints
{
    public static class ArticleEndpoints
    {
        public static void MapArticleEndpoints(this WebApplication app)
        {
            app.MapGet("/api/articles", async (IArticleService articleSvc) =>
            {
                var articles = await articleSvc.GetAllArticlesAsync();
                return Results.Ok(articles);
            });
        }
    }
}
