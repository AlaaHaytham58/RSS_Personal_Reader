using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Dtos;
using Services;

namespace Endpoints
{
    public static class UserEndpoints
    {
        private const long MaxImageBytes = 5 * 1024 * 1024;

        public static void MapUserEndpoints(this WebApplication app)
        {
            app.MapGet("/api/users/{username}", async (string username, IUserService svc) =>
            {
                var user = await svc.GetByUsernameAsync(username);
                return user is null ? Results.NotFound() : Results.Ok(user);
            });

            app.MapGet("/api/users/{username}/posts", async (string username, int? page, IUserService userSvc, IPostService postSvc, HttpContext ctx) =>
            {
                var user = await userSvc.GetByUsernameAsync(username);
                if (user is null) return Results.NotFound();

                var currentUserId = GetCurrentUserId(ctx);
                var posts = await postSvc.GetPostsByAuthorAsync(user.Id, page ?? 1, 20, currentUserId);
                return Results.Ok(posts);
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
            if (!ctx.Request.HasFormContentType)
            {
                return Results.BadRequest(new { error = "Expected multipart/form-data with an image file." });
            }

            var form = await ctx.Request.ReadFormAsync();
            var file = form.Files["file"];
            if (file == null || file.Length == 0)
            {
                return Results.BadRequest(new { error = "No image file was provided." });
            }

            if (file.Length > MaxImageBytes)
            {
                return Results.BadRequest(new { error = "Image must be 5 MB or smaller." });
            }

            var extension = await DetectImageExtensionAsync(file);
            if (extension == null)
            {
                return Results.BadRequest(new { error = "Only PNG, JPEG, GIF, or WEBP images are supported." });
            }

            var uploadsDir = Path.Combine(env.WebRootPath, "uploads", subfolder);
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(uploadsDir, fileName);

            await using (var stream = File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/{subfolder}/{fileName}";
            var updated = await onSaved(relativeUrl);
            return Results.Ok(updated);
        }

        // Sniffs the first bytes of the upload rather than trusting the client-supplied
        // content-type/filename, so a renamed non-image file can't slip through.
        private static async Task<string?> DetectImageExtensionAsync(IFormFile file)
        {
            var header = new byte[12];
            await using (var stream = file.OpenReadStream())
            {
                var read = await stream.ReadAsync(header.AsMemory(0, header.Length));
                if (read < 4) return null;
            }

            if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) return ".png";
            if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return ".jpg";
            if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38) return ".gif";
            if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) return ".webp";

            return null;
        }

        // Only deletes files this endpoint itself wrote (under wwwroot/uploads/{subfolder}),
        // so a crafted URL value can never be used to delete arbitrary files on disk.
        private static void DeleteOldUpload(IWebHostEnvironment env, string? previousUrl, string subfolder)
        {
            if (string.IsNullOrEmpty(previousUrl)) return;

            var prefix = $"/uploads/{subfolder}/";
            if (!previousUrl.StartsWith(prefix, StringComparison.Ordinal)) return;

            var fileName = Path.GetFileName(previousUrl);
            if (string.IsNullOrEmpty(fileName)) return;

            var fullPath = Path.Combine(env.WebRootPath, "uploads", subfolder, fileName);
            if (File.Exists(fullPath))
            {
                try { File.Delete(fullPath); } catch { /* best-effort cleanup */ }
            }
        }

        private static Guid? GetCurrentUserId(HttpContext ctx)
        {
            if (ctx.User.Identity?.IsAuthenticated != true) return null;

            var raw = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return raw != null && Guid.TryParse(raw, out var id) ? id : null;
        }
    }
}
