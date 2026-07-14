using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Dtos;
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

            app.MapGet("/api/history", async (int? limit, IArticleService articleSvc) =>
            {
                var history = await articleSvc.GetHistoryAsync(limit is > 0 ? limit.Value : 100);
                return Results.Ok(history);
            });

            app.MapPost("/api/articles/read", async (MarkReadRequest req, IArticleService articleSvc) =>
            {
                var ok = await articleSvc.MarkReadAsync(req.FeedId, req.ArticleId);
                return ok ? Results.NoContent() : Results.BadRequest(new { error = "ArticleId is required" });
            });

            app.MapPost("/api/articles/favorite", async (SetFavoriteRequest req, IArticleService articleSvc) =>
            {
                var ok = await articleSvc.SetFavoriteAsync(req.FeedId, req.ArticleId, req.IsFavorite);
                return ok ? Results.NoContent() : Results.BadRequest(new { error = "ArticleId is required" });
            });
        }
    }
}
