using System;

namespace Domain
{
    public enum NotificationType
    {
        Reaction,
        Reply,
        Follow
    }

    public class Notification
    {
        public Guid Id { get; set; }
        public Guid RecipientId { get; set; }
        public Guid ActorId { get; set; }
        public NotificationType Type { get; set; }
        public Guid? PostId { get; set; }
        public bool IsRead { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
