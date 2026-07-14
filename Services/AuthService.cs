using System;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Dtos;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Security;

namespace Services
{
    public class AuthService : IAuthService
    {
        private const int MinUsernameLength = 3;
        private const int MaxUsernameLength = 32;
        private const int MinPasswordLength = 8;

        private readonly IDbContextFactory<AppDbContext> _contextFactory;

        public AuthService(IDbContextFactory<AppDbContext> contextFactory)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        }

        public async Task<AuthOutcome> RegisterAsync(string username, string password)
        {
            username = username?.Trim() ?? "";
            if (username.Length < MinUsernameLength || username.Length > MaxUsernameLength
                || string.IsNullOrEmpty(password) || password.Length < MinPasswordLength)
            {
                return new AuthValidationError();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var exists = await db.Users.AnyAsync(u => u.Username == username);
            if (exists)
            {
                return new AuthUsernameTaken();
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                PasswordHash = PasswordHasher.Hash(password),
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return new AuthSuccess { User = ToResponse(user) };
        }

        public async Task<AuthOutcome> ValidateCredentialsAsync(string username, string password)
        {
            username = username?.Trim() ?? "";
            if (username.Length == 0 || string.IsNullOrEmpty(password))
            {
                return new AuthValidationError();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null || user.PasswordHash == null || !PasswordHasher.Verify(password, user.PasswordHash))
            {
                return new AuthInvalidCredentials();
            }

            return new AuthSuccess { User = ToResponse(user) };
        }

        public async Task<AuthOutcome> ExternalLoginAsync(string googleId, string? email, string? displayName)
        {
            if (string.IsNullOrWhiteSpace(googleId))
            {
                return new AuthValidationError();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
            if (user == null && !string.IsNullOrWhiteSpace(email))
            {
                // Link an existing password account that shares this Google email.
                user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user != null)
                {
                    user.GoogleId = googleId;
                }
            }

            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = await GenerateUniqueUsernameAsync(db, displayName ?? email ?? "user"),
                    Email = email,
                    GoogleId = googleId,
                    PasswordHash = null,
                    CreatedAt = DateTimeOffset.UtcNow,
                };
                db.Users.Add(user);
            }

            await db.SaveChangesAsync();

            return new AuthSuccess { User = ToResponse(user) };
        }

        private static async Task<string> GenerateUniqueUsernameAsync(AppDbContext db, string seed)
        {
            var baseName = new string(seed.Trim().ToLowerInvariant()
                .TakeWhile(c => c != '@')
                .Where(c => char.IsLetterOrDigit(c))
                .ToArray());
            if (baseName.Length < MinUsernameLength)
            {
                baseName = "user";
            }
            if (baseName.Length > MaxUsernameLength)
            {
                baseName = baseName[..MaxUsernameLength];
            }

            var candidate = baseName;
            var suffix = 0;
            while (await db.Users.AnyAsync(u => u.Username == candidate))
            {
                suffix++;
                var suffixText = suffix.ToString();
                candidate = baseName[..Math.Min(baseName.Length, MaxUsernameLength - suffixText.Length)] + suffixText;
            }

            return candidate;
        }

        private static UserResponse ToResponse(User user) => new() { Id = user.Id, Username = user.Username };
    }
}
