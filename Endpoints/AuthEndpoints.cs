using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Dtos;
using Services;

namespace Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            app.MapPost("/api/auth/register", async (RegisterRequest req, IAuthService svc, HttpContext ctx) =>
            {
                if (req == null) return Results.BadRequest(new { error = "Username and password are required" });

                var outcome = await svc.RegisterAsync(req.Username, req.Password);
                if (outcome is AuthSuccess s)
                {
                    await SignInAsync(ctx, s.User);
                    return Results.Created($"/api/auth/me", s.User);
                }

                return outcome switch
                {
                    AuthUsernameTaken t => Results.Conflict(new { error = t.Message }),
                    AuthValidationError v => Results.BadRequest(new { error = v.Message }),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapPost("/api/auth/login", async (LoginRequest req, IAuthService svc, HttpContext ctx) =>
            {
                if (req == null) return Results.BadRequest(new { error = "Username and password are required" });

                var outcome = await svc.ValidateCredentialsAsync(req.Username, req.Password);
                if (outcome is AuthSuccess s)
                {
                    await SignInAsync(ctx, s.User);
                    return Results.Ok(s.User);
                }

                return outcome switch
                {
                    AuthInvalidCredentials i => Results.Json(new { error = i.Message }, statusCode: 401),
                    AuthValidationError v => Results.BadRequest(new { error = v.Message }),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapGet("/api/auth/google/login", async (HttpContext ctx, Microsoft.AspNetCore.Authentication.IAuthenticationSchemeProvider schemes, string? returnUrl) =>
            {
                if (await schemes.GetSchemeAsync(GoogleDefaults.AuthenticationScheme) is null)
                {
                    return Results.Json(new { error = "Google sign-in is not configured on this server." }, statusCode: 503);
                }

                var redirectUri = string.IsNullOrEmpty(returnUrl) ? "/" : returnUrl;
                var properties = new AuthenticationProperties { RedirectUri = redirectUri };
                return Results.Challenge(properties, new[] { GoogleDefaults.AuthenticationScheme });
            });

            app.MapPost("/api/auth/logout", async (HttpContext ctx) =>
            {
                await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return Results.NoContent();
            });

            app.MapGet("/api/auth/me", (HttpContext ctx) =>
            {
                if (ctx.User.Identity?.IsAuthenticated != true) return Results.StatusCode(401);

                var id = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
                var username = ctx.User.FindFirstValue(ClaimTypes.Name);
                if (id == null || username == null) return Results.StatusCode(401);

                return Results.Ok(new UserResponse { Id = System.Guid.Parse(id), Username = username });
            });
        }

        private static Task SignInAsync(HttpContext ctx, UserResponse user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Username),
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var properties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = System.DateTimeOffset.UtcNow.AddDays(30),
            };
            return ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity), properties);
        }
    }
}
