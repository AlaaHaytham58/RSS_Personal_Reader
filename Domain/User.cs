using System;

namespace Domain
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;

        // PBKDF2 hash packed as "{iterations}.{saltBase64}.{hashBase64}".
        public string PasswordHash { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }
}
