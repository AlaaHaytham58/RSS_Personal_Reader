using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using Services;

namespace Endpoints
{
    public static class NotificationEndpoints
    {
        public static void MapNotificationEndpoints(this WebApplication app)
        {
            app.MapGet("/api/notifications", async (int? page, INotificationService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.GetForUserAsync(userId.Value, page ?? 1, 20);
                return outcome switch
                {
                    NotificationsFetched f => Results.Ok(f.Result),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapGet("/api/notifications/unread-count", async (INotificationService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var count = await svc.GetUnreadCountAsync(userId.Value);
                return Results.Ok(new Dtos.UnreadCountResponse { UnreadCount = count });
            });

            app.MapPost("/api/notifications/{id:guid}/read", async (Guid id, INotificationService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                var outcome = await svc.MarkReadAsync(userId.Value, id);
                return outcome switch
                {
                    NotificationMarkedRead _ => Results.NoContent(),
                    NotificationNotFound _ => Results.NotFound(),
                    NotificationForbidden _ => Results.StatusCode(403),
                    _ => Results.StatusCode(500)
                };
            });

            app.MapPost("/api/notifications/read-all", async (INotificationService svc, HttpContext ctx) =>
            {
                var userId = GetCurrentUserId(ctx);
                if (userId == null) return Results.StatusCode(401);

                await svc.MarkAllReadAsync(userId.Value);
                return Results.NoContent();
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
