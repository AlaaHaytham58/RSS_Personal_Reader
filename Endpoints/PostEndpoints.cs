using Microsoft.AspNetCore.Builder;
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
            app.MapGet("/api/posts", async (int? page, IPostService svc) =>
            {
                var posts = await svc.GetTimelineAsync(page ?? 1, 20);
                return Results.Ok(posts);
            });

            app.MapGet("/api/posts/{id:guid}", async (Guid id, IPostService svc) =>
            {
                var outcome = await svc.GetThreadAsync(id);
                return outcome switch
                {
                    ThreadSuccess t => Results.Ok(t.Thread),
                    PostNotFound _ => Results.NotFound(),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapPost("/api/posts", async (CreatePostRequest req, IPostService svc, HttpContext ctx) =>
            {
                if (ctx.User.Identity?.IsAuthenticated != true) return Results.StatusCode(401);

                var authorIdRaw = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (authorIdRaw == null || !Guid.TryParse(authorIdRaw, out var authorId)) return Results.StatusCode(401);

                if (req == null) return Results.BadRequest(new { error = "Content is required" });

                var outcome = await svc.CreatePostAsync(authorId, req.Content, req.ParentPostId);
                return outcome switch
                {
                    PostSuccess s => Results.Created($"/api/posts/{s.Post.Id}", s.Post),
                    PostContentInvalid c => Results.BadRequest(new { error = c.Message }),
                    PostParentNotFound p => Results.NotFound(new { error = p.Message }),
                    _ => Results.StatusCode(500)
                };
            });
        }
    }
}
