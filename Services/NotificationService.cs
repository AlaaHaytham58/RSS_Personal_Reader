using System;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Dtos;
using Hubs;
using Infrastructure.Storage;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class NotificationService : INotificationService
    {
        private readonly IDbContextFactory<AppDbContext> _contextFactory;
        private readonly IHubContext<CommunityHub> _hub;

        public NotificationService(IDbContextFactory<AppDbContext> contextFactory, IHubContext<CommunityHub> hub)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
            _hub = hub ?? throw new ArgumentNullException(nameof(hub));
        }

        public async Task CreateAsync(Guid recipientId, Guid actorId, NotificationType type, Guid? postId)
        {
            if (recipientId == actorId) return;

            await using var db = await _contextFactory.CreateDbContextAsync();

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = recipientId,
                ActorId = actorId,
                Type = type,
                PostId = postId,
                IsRead = false,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Notifications.Add(notification);
            await db.SaveChangesAsync();

            var actor = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == actorId);
            var response = ToResponse(notification, actor?.Username ?? "unknown", actor?.AvatarUrl);
            var unreadCount = await db.Notifications.AsNoTracking().CountAsync(n => n.RecipientId == recipientId && !n.IsRead);

            await _hub.Clients.Group(GroupName(recipientId)).SendAsync("Notification", new { notification = response, unreadCount });
        }

        public async Task<NotificationOutcome> GetForUserAsync(Guid userId, int page, int pageSize)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var users = await db.Users.AsNoTracking().ToDictionaryAsync(u => u.Id, u => (u.Username, u.AvatarUrl));

            // SQLite can't ORDER BY DateTimeOffset server-side, so sort client-side after fetching.
            var all = (await db.Notifications.AsNoTracking().Where(n => n.RecipientId == userId).ToListAsync())
                .OrderByDescending(n => n.CreatedAt)
                .ToList();

            var pageItems = all.Skip((page - 1) * pageSize).Take(pageSize)
                .Select(n => ToResponse(n, users.TryGetValue(n.ActorId, out var actor) ? actor.Username : "unknown", users.TryGetValue(n.ActorId, out var actor2) ? actor2.AvatarUrl : null))
                .ToList();

            var unreadCount = all.Count(n => !n.IsRead);

            return new NotificationsFetched
            {
                Result = new NotificationListResponse
                {
                    Items = pageItems,
                    UnreadCount = unreadCount,
                    HasMore = page * pageSize < all.Count,
                },
            };
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            return await db.Notifications.AsNoTracking().CountAsync(n => n.RecipientId == userId && !n.IsRead);
        }

        public async Task<NotificationOutcome> MarkReadAsync(Guid userId, Guid notificationId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var notification = await db.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId);
            if (notification == null) return new NotificationNotFound();
            if (notification.RecipientId != userId) return new NotificationForbidden();

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await db.SaveChangesAsync();
            }

            return new NotificationMarkedRead();
        }

        public async Task<NotificationOutcome> MarkAllReadAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var unread = await db.Notifications.Where(n => n.RecipientId == userId && !n.IsRead).ToListAsync();
            foreach (var n in unread) n.IsRead = true;
            if (unread.Count > 0) await db.SaveChangesAsync();

            return new NotificationMarkedRead();
        }

        public static string GroupName(Guid userId) => $"user:{userId}";

        private static NotificationResponse ToResponse(Notification n, string actorUsername, string? actorAvatarUrl) => new()
        {
            Id = n.Id,
            Type = n.Type.ToString(),
            ActorId = n.ActorId,
            ActorUsername = actorUsername,
            ActorAvatarUrl = actorAvatarUrl,
            PostId = n.PostId,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
        };
    }
}
