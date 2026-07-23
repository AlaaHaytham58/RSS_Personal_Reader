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
                if (req == null) return Results.BadRequest(new { error = "Username, email and password are required" });

                var outcome = await svc.RegisterAsync(req.Username, req.Email, req.Password, GetGuestUserId(ctx));
                if (outcome is AuthSuccess s)
                {
                    await SignInAsync(ctx, s.User);
                    return Results.Created($"/api/auth/me", s.User);
                }

                return outcome switch
                {
                    AuthUsernameTaken t => Results.Conflict(new { error = t.Message }),
                    AuthEmailTaken e => Results.Conflict(new { error = e.Message }),
                    AuthEmailInvalid i => Results.BadRequest(new { error = i.Message }),
                    AuthValidationError v => Results.BadRequest(new { error = v.Message }),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapPost("/api/auth/forgot-password", async (ForgotPasswordRequest req, IAuthService svc, HttpContext ctx) =>
            {
                if (req == null || string.IsNullOrWhiteSpace(req.Email))
                {
                    return Results.BadRequest(new { error = "Email is required" });
                }

                var baseUrl = $"{ctx.Request.Scheme}://{ctx.Request.Host}";
                await svc.ForgotPasswordAsync(req.Email, baseUrl);

                // Always the same generic response regardless of whether the email matched,
                // so this endpoint can't be used to enumerate registered accounts.
                return Results.Ok(new { message = "If that email is registered, a reset link has been sent." });
            });

            app.MapPost("/api/auth/reset-password", async (ResetPasswordRequest req, IAuthService svc) =>
            {
                if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Token))
                {
                    return Results.BadRequest(new { error = "Email and token are required" });
                }

                var outcome = await svc.ResetPasswordAsync(req.Email, req.Token, req.NewPassword);
                return outcome switch
                {
                    AuthSuccess => Results.Ok(new { message = "Password updated." }),
                    AuthResetTokenInvalid i => Results.Json(new { error = i.Message }, statusCode: 400),
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

            app.MapGet("/api/auth/me", async (HttpContext ctx, Services.IUserService userSvc) =>
            {
                if (ctx.User.Identity?.IsAuthenticated != true) return Results.StatusCode(401);

                var id = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (id == null || !System.Guid.TryParse(id, out var userId)) return Results.StatusCode(401);

                var user = await userSvc.GetByIdAsync(userId);
                return user is null ? Results.StatusCode(401) : Results.Ok(user);
            });
        }

        // If the current session is a guest, returns its user id so register/Google-login can
        // upgrade the same row in place instead of creating an unrelated new account.
        private static System.Guid? GetGuestUserId(HttpContext ctx)
        {
            if (ctx.User.Identity?.IsAuthenticated != true) return null;
            if (ctx.User.FindFirstValue("is_guest") != "true") return null;

            var raw = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return raw != null && System.Guid.TryParse(raw, out var id) ? id : null;
        }

        private static Task SignInAsync(HttpContext ctx, UserResponse user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Username),
                new("is_guest", user.IsGuest ? "true" : "false"),
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
