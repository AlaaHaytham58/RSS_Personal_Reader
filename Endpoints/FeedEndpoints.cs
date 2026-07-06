using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using Dtos;
using Services;

namespace Endpoints
{
    public static class FeedEndpoints
    {
        public static void MapFeedEndpoints(this WebApplication app)
        {
            app.MapPost("/api/feeds", async (AddFeedRequest req, IFeedService svc) =>
            {
                if (req == null || string.IsNullOrWhiteSpace(req.Url)) return Results.BadRequest(new { error = "Url is required" });

                var outcome = await svc.AddFeedAsync(req.Url);
                return outcome switch
                {
                    AddFeedSuccess s => Results.Created($"/api/feeds/{s.Feed.Id}", new FeedResponse { Id = s.Feed.Id, Title = s.Feed.Title, Url = s.Feed.Url, SiteUrl = s.Feed.SiteUrl, LastRefreshedAt = s.Feed.LastRefreshedAt, LastRefreshStatus = s.Feed.LastRefreshStatus.ToString(), ArticleCount = s.Feed.Articles?.Count ?? 0 }),
                    AddFeedInvalidUrl _ => Results.BadRequest(new { error = "Invalid URL" }),
                    AddFeedAlreadyExists _ => Results.Conflict(new { error = "Already subscribed" }),
                    AddFeedUnreachable u => Results.UnprocessableEntity(new { error = u.Message }),
                    AddFeedNotAFeed n => Results.UnprocessableEntity(new { error = n.Message }),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapGet("/api/feeds", async (IFeedService svc) =>
            {
                var feeds = await svc.GetAllFeedsAsync();
                var list = feeds.ConvertAll(f => new FeedResponse { Id = f.Id, Title = f.Title, Url = f.Url, SiteUrl = f.SiteUrl, LastRefreshedAt = f.LastRefreshedAt, LastRefreshStatus = f.LastRefreshStatus.ToString(), ArticleCount = f.Articles?.Count ?? 0 });
                return Results.Ok(list);
            });

            app.MapDelete("/api/feeds/{id:guid}", async (Guid id, IFeedService svc) =>
            {
                var ok = await svc.RemoveFeedAsync(id);
                return ok ? Results.NoContent() : Results.NotFound();
            });

            app.MapPost("/api/feeds/{id:guid}/refresh", async (Guid id, IFeedService svc) =>
            {
                var outcome = await svc.RefreshFeedAsync(id);
                return outcome switch
                {
                    RefreshSuccess _ => Results.Ok(new { status = "success" }),
                    RefreshNotFound _ => Results.NotFound(),
                    RefreshFailed f => Results.UnprocessableEntity(new { error = f.Message }),
                    _ => Results.StatusCode(500)
                };
            });
        }
    }
}
