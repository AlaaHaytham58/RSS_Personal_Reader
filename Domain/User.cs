using System;

namespace Domain
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;

        // PBKDF2 hash packed as "{iterations}.{saltBase64}.{hashBase64}".
        // Null for accounts created via an external provider (e.g. Google) that never set a password.
        public string? PasswordHash { get; set; }
        public string? Email { get; set; }
        public string? GoogleId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        // Relative URLs (e.g. "/uploads/avatars/{file}") under wwwroot. Null means the
        // client falls back to its default initial-letter avatar / gradient cover.
        public string? AvatarUrl { get; set; }
        public string? CoverUrl { get; set; }

        public string? Bio { get; set; }

        // Serialized List<Dtos.SocialLinkDto> ("platform"/"url" pairs); parsed on read in UserService.
        public string? SocialLinksJson { get; set; }

        // True for anonymous sessions auto-created so visitors can use the app without
        // signing up. Guests are purged (cascading to their feeds/articles) after 7 days;
        // see GuestCleanupService. AI features (summary/chat) are blocked for guests.
        public bool IsGuest { get; set; }
    }
}
