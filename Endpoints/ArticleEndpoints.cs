using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Dtos;
using Services;

namespace Endpoints
{
    public static class ArticleEndpoints
    {
        public static void MapArticleEndpoints(this WebApplication app)
        {
            app.MapGet("/api/articles", async (IArticleService articleSvc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var articles = await articleSvc.GetAllArticlesAsync(userId.Value);
                return Results.Ok(articles);
            });

            app.MapGet("/api/history", async (int? limit, IArticleService articleSvc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var history = await articleSvc.GetHistoryAsync(userId.Value, limit is > 0 ? limit.Value : 100);
                return Results.Ok(history);
            });

            app.MapPost("/api/articles/read", async (MarkReadRequest req, IArticleService articleSvc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var ok = await articleSvc.MarkReadAsync(userId.Value, req.FeedId, req.ArticleId);
                return ok ? Results.NoContent() : Results.BadRequest(new { error = "ArticleId is required" });
            });

            app.MapPost("/api/articles/favorite", async (SetFavoriteRequest req, IArticleService articleSvc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var ok = await articleSvc.SetFavoriteAsync(userId.Value, req.FeedId, req.ArticleId, req.IsFavorite);
                return ok ? Results.NoContent() : Results.BadRequest(new { error = "ArticleId is required" });
            });
        }

        private static Guid? GetCurrentUserId(HttpContext ctx)
        {
            if (ctx.User.Identity?.IsAuthenticated != true) return null;

            var raw = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return raw != null && Guid.TryParse(raw, out var id) ? id : null;
        }
    }
}
