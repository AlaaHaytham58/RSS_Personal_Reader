using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using Dtos;
using Services;

namespace Endpoints
{
    public static class PostEndpoints
    {
        public static void MapPostEndpoints(this WebApplication app)
        {
            app.MapGet("/api/posts", async (int? page, IPostService svc, HttpContext ctx) =>
            {
                var currentUserId = GetCurrentUserId(ctx);
                var posts = await svc.GetTimelineAsync(page ?? 1, 20, currentUserId);
                return Results.Ok(posts);
            });

            app.MapGet("/api/posts/{id:guid}", async (Guid id, IPostService svc, HttpContext ctx) =>
            {
                var currentUserId = GetCurrentUserId(ctx);
                var outcome = await svc.GetThreadAsync(id, currentUserId);
                return outcome switch
                {
                    ThreadSuccess t => Results.Ok(t.Thread),
                    PostNotFound _ => Results.NotFound(),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapPost("/api/posts", async (CreatePostRequest req, IPostService svc, HttpContext ctx) =>
            {
                var authorId = GetCurrentUserId(ctx);
                if (authorId == null) return Results.StatusCode(401);

                if (req == null) return Results.BadRequest(new { error = "Content is required" });

                var outcome = await svc.CreatePostAsync(authorId.Value, req.Content, req.ParentPostId, req.ImageUrl, req.FileUrl, req.FileName);
                return outcome switch
                {
                    PostSuccess s => Results.Created($"/api/posts/{s.Post.Id}", s.Post),
                    PostContentInvalid c => Results.BadRequest(new { error = c.Message }),
                    PostParentNotFound p => Results.NotFound(new { error = p.Message }),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapPost("/api/posts/image", async (HttpContext ctx, IWebHostEnvironment env) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var (relativeUrl, error) = await ImageUploadHelper.SaveUploadedImageAsync(ctx, env, "posts");
                return relativeUrl == null
                    ? Results.BadRequest(new { error })
                    : Results.Ok(new { url = relativeUrl });
            });

            app.MapPost("/api/posts/{id:guid}/react", async (Guid id, ReactToPostRequest req, IPostService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);
                if (req == null) return Results.BadRequest(new { error = "Reaction type is required" });

                var outcome = await svc.ToggleReactionAsync(userId.Value, id, req.ReactionType);
                return outcome switch
                {
                    ReactionSuccess r => Results.Ok(new { reactionCounts = r.ReactionCounts, currentUserReaction = r.CurrentUserReaction?.ToString() }),
                    PostNotFound _ => Results.NotFound(),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapPost("/api/posts/file", async (HttpContext ctx, IWebHostEnvironment env) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var (relativeUrl, originalFileName, error) = await FileUploadHelper.SaveUploadedFileAsync(ctx, env, "postfiles");
                return relativeUrl == null
                    ? Results.BadRequest(new { error })
                    : Results.Ok(new { url = relativeUrl, fileName = originalFileName });
            });
            app.MapPut("/api/posts/{id:guid}", async (Guid id, EditPostRequest req, IPostService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                if (req == null) return Results.BadRequest(new { error = "Content is required" });

                var outcome = await svc.EditPostAsync(userId.Value, id, req.Content);
                return outcome switch
                {
                    PostEdited e => Results.Ok(e.Post),
                    PostContentInvalid c => Results.BadRequest(new { error = c.Message }),
                    PostNotFound _ => Results.NotFound(),
                    PostForbidden _ => Results.StatusCode(403),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapDelete("/api/posts/{id:guid}", async (Guid id, IPostService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.DeletePostAsync(userId.Value, id);
                return outcome switch
                {
                    PostDeleted _ => Results.NoContent(),
                    PostNotFound _ => Results.NotFound(),
                    PostForbidden _ => Results.StatusCode(403),
                    _ => Results.StatusCode(500)
                };
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
