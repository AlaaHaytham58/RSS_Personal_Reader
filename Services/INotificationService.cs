using System;
using System.Threading.Tasks;
using Domain;

namespace Services
{
    public interface INotificationService
    {
        Task CreateAsync(Guid recipientId, Guid actorId, NotificationType type, Guid? postId);
        Task<NotificationOutcome> GetForUserAsync(Guid userId, int page, int pageSize);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<NotificationOutcome> MarkReadAsync(Guid userId, Guid notificationId);
        Task<NotificationOutcome> MarkAllReadAsync(Guid userId);
    }
}
