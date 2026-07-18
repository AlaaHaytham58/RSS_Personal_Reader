using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Dtos;
using Services;

namespace Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this WebApplication app)
        {
            app.MapGet("/api/users/{username}", async (string username, HttpContext ctx, IUserService svc) =>
            {
                var user = await svc.GetByUsernameAsync(username, GetCurrentUserId(ctx));
                return user is null ? Results.NotFound() : Results.Ok(user);
            });

            app.MapGet("/api/users/{username}/posts", async (string username, int? page, IUserService userSvc, IPostService postSvc, HttpContext ctx) =>
            {
                var currentUserId = GetCurrentUserId(ctx);
                var user = await userSvc.GetByUsernameAsync(username, currentUserId);
                if (user is null) return Results.NotFound();

                var posts = await postSvc.GetPostsByAuthorAsync(user.Id, page ?? 1, 20, currentUserId);
                return Results.Ok(posts);
            });

            app.MapGet("/api/users/search", async (string? q, HttpContext ctx, ISocialService svc) =>
            {
                var results = await svc.SearchUsersAsync(q ?? "", GetCurrentUserId(ctx));
                return Results.Ok(results);
            });

            app.MapPost("/api/users/{username}/follow", async (string username, HttpContext ctx, ISocialService svc) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.FollowAsync(userId.Value, username);
                return outcome switch
                {
                    FollowSuccess s => Results.Ok(new { s.FollowerCount, s.IsFollowing }),
                    FollowUserNotFound => Results.NotFound(),
                    FollowSelfError e => Results.BadRequest(new { error = e.Message }),
                    FollowBlockedError e => Results.BadRequest(new { error = e.Message }),
                    _ => Results.StatusCode(500),
                };
            });

            app.MapDelete("/api/users/{username}/follow", async (string username, HttpContext ctx, ISocialService svc) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.UnfollowAsync(userId.Value, username);
                return outcome switch
                {
                    FollowSuccess s => Results.Ok(new { s.FollowerCount, s.IsFollowing }),
                    FollowUserNotFound => Results.NotFound(),
                    _ => Results.StatusCode(500),
                };
            });

            app.MapPost("/api/users/{username}/block", async (string username, HttpContext ctx, ISocialService svc) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.BlockAsync(userId.Value, username);
                return outcome switch
                {
                    BlockSuccess s => Results.Ok(new { s.IsBlocked }),
                    BlockUserNotFound => Results.NotFound(),
                    BlockSelfError e => Results.BadRequest(new { error = e.Message }),
                    _ => Results.StatusCode(500),
                };
            });

            app.MapDelete("/api/users/{username}/block", async (string username, HttpContext ctx, ISocialService svc) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.UnblockAsync(userId.Value, username);
                return outcome switch
                {
                    BlockSuccess s => Results.Ok(new { s.IsBlocked }),
                    BlockUserNotFound => Results.NotFound(),
                    _ => Results.StatusCode(500),
                };
            });

            app.MapPost("/api/users/{username}/report", async (string username, ReportUserRequest? req, HttpContext ctx, ISocialService svc) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.ReportAsync(userId.Value, username, req?.Reason);
                return outcome switch
                {
                    ReportSuccess => Results.Ok(),
                    ReportUserNotFound => Results.NotFound(),
                    ReportSelfError e => Results.BadRequest(new { error = e.Message }),
                    _ => Results.StatusCode(500),
                };
            });

            app.MapPut("/api/users/me", async (UpdateProfileRequest req, HttpContext ctx, IUserService svc) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);
                if (req == null) return Results.BadRequest(new { error = "Profile details are required." });

                var outcome = await svc.UpdateProfileAsync(userId.Value, req.Username, req.Bio, req.SocialLinks);
                if (outcome is ProfileSuccess s)
                {
                    // Refresh the auth cookie's Name claim so it doesn't go stale after a rename.
                    var isGuest = ctx.User.FindFirstValue("is_guest") == "true";
                    var claims = new List<Claim>
                    {
                        new(ClaimTypes.NameIdentifier, s.User.Id.ToString()),
                        new(ClaimTypes.Name, s.User.Username),
                        new("is_guest", isGuest ? "true" : "false"),
                    };
                    var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity), new AuthenticationProperties
                    {
                        IsPersistent = true,
                        ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30),
                    });

                    return Results.Ok(s.User);
                }

                return outcome switch
                {
                    ProfileUsernameTaken t => Results.Conflict(new { error = t.Message }),
                    ProfileValidationError v => Results.BadRequest(new { error = v.Message }),
                    _ => Results.StatusCode(500),
                };
            });

            app.MapPost("/api/users/me/avatar", async (HttpContext ctx, IUserService svc, IWebHostEnvironment env) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                return await SaveImageAsync(ctx, env, "avatars", async relativeUrl =>
                {
                    var previous = await svc.GetByIdAsync(userId.Value);
                    var updated = await svc.UpdateAvatarAsync(userId.Value, relativeUrl);
                    DeleteOldUpload(env, previous?.AvatarUrl, "avatars");
                    return updated;
                });
            });

            app.MapDelete("/api/users/me/avatar", async (HttpContext ctx, IUserService svc, IWebHostEnvironment env) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var previous = await svc.GetByIdAsync(userId.Value);
                var updated = await svc.RemoveAvatarAsync(userId.Value);
                DeleteOldUpload(env, previous?.AvatarUrl, "avatars");
                return Results.Ok(updated);
            });

            app.MapPost("/api/users/me/cover", async (HttpContext ctx, IUserService svc, IWebHostEnvironment env) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                return await SaveImageAsync(ctx, env, "covers", async relativeUrl =>
                {
                    var previous = await svc.GetByIdAsync(userId.Value);
                    var updated = await svc.UpdateCoverAsync(userId.Value, relativeUrl);
                    DeleteOldUpload(env, previous?.CoverUrl, "covers");
                    return updated;
                });
            });

            app.MapDelete("/api/users/me/cover", async (HttpContext ctx, IUserService svc, IWebHostEnvironment env) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var previous = await svc.GetByIdAsync(userId.Value);
                var updated = await svc.RemoveCoverAsync(userId.Value);
                DeleteOldUpload(env, previous?.CoverUrl, "covers");
                return Results.Ok(updated);
            });
        }

        private static async Task<IResult> SaveImageAsync(HttpContext ctx, IWebHostEnvironment env, string subfolder, Func<string, Task<UserResponse>> onSaved)
        {
            var (relativeUrl, error) = await ImageUploadHelper.SaveUploadedImageAsync(ctx, env, subfolder);
            if (relativeUrl == null)
            {
                return Results.BadRequest(new { error });
            }

            var updated = await onSaved(relativeUrl);
            return Results.Ok(updated);
        }

        private static void DeleteOldUpload(IWebHostEnvironment env, string? previousUrl, string subfolder) =>
            ImageUploadHelper.DeleteUpload(env, previousUrl, subfolder);

        private static Guid? GetCurrentUserId(HttpContext ctx)
        {
            if (ctx.User.Identity?.IsAuthenticated != true) return null;

            var raw = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return raw != null && Guid.TryParse(raw, out var id) ? id : null;
        }
    }
}
