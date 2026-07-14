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
    }
}
