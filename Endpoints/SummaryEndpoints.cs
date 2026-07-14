using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using Services;

namespace Endpoints
{
    public static class SummaryEndpoints
    {
        public static void MapSummaryEndpoints(this WebApplication app)
        {
            app.MapGet("/api/summary/daily", async (ISummaryService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var summary = await svc.GetDailySummaryAsync(userId.Value);
                return summary == null
                    ? Results.Json(new { error = "The AI assistant isn't available right now." }, statusCode: 503)
                    : Results.Ok(summary);
            });

            app.MapPost("/api/summary/daily/refresh", async (ISummaryService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var summary = await svc.RefreshDailySummaryAsync(userId.Value);
                return summary == null
                    ? Results.Json(new { error = "The AI assistant isn't available right now." }, statusCode: 503)
                    : Results.Ok(summary);
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
