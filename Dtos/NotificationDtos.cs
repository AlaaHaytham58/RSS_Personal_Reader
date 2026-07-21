using System;
using System.Collections.Generic;

namespace Dtos
{
    public class NotificationResponse
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = "";
        public Guid ActorId { get; set; }
        public string ActorUsername { get; set; } = "";
        public string? ActorAvatarUrl { get; set; }
        public Guid? PostId { get; set; }
        public bool IsRead { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class NotificationListResponse
    {
        public List<NotificationResponse> Items { get; set; } = new();
        public int UnreadCount { get; set; }
        public bool HasMore { get; set; }
    }

    public class UnreadCountResponse
    {
        public int UnreadCount { get; set; }
    }
}
