using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
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
        private readonly IEmailSender _emailSender;

        public AuthService(IDbContextFactory<AppDbContext> contextFactory, IEmailSender emailSender)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
            _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        }

        public async Task<AuthOutcome> RegisterAsync(string username, string email, string password, Guid? claimGuestUserId = null)
        {
            username = username?.Trim() ?? "";
            email = email?.Trim() ?? "";
            if (username.Length < MinUsernameLength || username.Length > MaxUsernameLength
                || string.IsNullOrEmpty(password) || password.Length < MinPasswordLength)
            {
                return new AuthValidationError();
            }

            if (!IsValidEmail(email))
            {
                return new AuthEmailInvalid();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var usernameExists = await db.Users.AnyAsync(u => u.Username == username && u.Id != claimGuestUserId);
            if (usernameExists)
            {
                return new AuthUsernameTaken();
            }

            var emailExists = await db.Users.AnyAsync(u => u.Email == email && u.Id != claimGuestUserId);
            if (emailExists)
            {
                return new AuthEmailTaken();
            }

            // If the caller is currently browsing as a guest, upgrade that same row in place
            // (rather than inserting a new user) so their feeds/articles carry over.
            var user = claimGuestUserId is Guid guestId
                ? await db.Users.FirstOrDefaultAsync(u => u.Id == guestId && u.IsGuest)
                : null;

            if (user != null)
            {
                user.Username = username;
                user.Email = email;
                user.PasswordHash = PasswordHasher.Hash(password);
                user.IsGuest = false;
            }
            else
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = username,
                    Email = email,
                    PasswordHash = PasswordHasher.Hash(password),
                    CreatedAt = DateTimeOffset.UtcNow,
                };
                db.Users.Add(user);
            }

            await db.SaveChangesAsync();

            return new AuthSuccess { User = ToResponse(user) };
        }

        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return false;
            }

            try
            {
                var address = new System.Net.Mail.MailAddress(email);
                return address.Address == email;
            }
            catch (FormatException)
            {
                return false;
            }
        }

        public async Task<Dtos.UserResponse> CreateGuestAsync()
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = "guest-" + Guid.NewGuid().ToString("N")[..10],
                IsGuest = true,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return ToResponse(user);
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

        public async Task<AuthOutcome> ForgotPasswordAsync(string email, string baseUrl)
        {
            email = email?.Trim() ?? "";
            if (email.Length == 0)
            {
                return new AuthValidationError();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user != null)
            {
                var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                    .Replace('+', '-').Replace('/', '_').TrimEnd('=');
                user.PasswordResetTokenHash = HashToken(rawToken);
                user.PasswordResetTokenExpiresAt = DateTimeOffset.UtcNow.AddHours(1);
                await db.SaveChangesAsync();

                var link = $"{baseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(rawToken)}&email={Uri.EscapeDataString(email)}";
                await _emailSender.SendAsync(
                    email,
                    "Reset your RSS Reader password",
                    $"We received a request to reset your password. Open this link to choose a new one (valid for 1 hour):\n\n{link}\n\nIf you didn't request this, you can safely ignore this email.");
            }

            // Always the same outcome whether or not the email matched, to avoid user enumeration.
            return new ForgotPasswordAccepted();
        }

        public async Task<AuthOutcome> ResetPasswordAsync(string email, string token, string newPassword)
        {
            email = email?.Trim() ?? "";
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                return new AuthResetTokenInvalid();
            }

            if (string.IsNullOrEmpty(newPassword) || newPassword.Length < MinPasswordLength)
            {
                return new AuthValidationError();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user?.PasswordResetTokenHash == null
                || user.PasswordResetTokenExpiresAt is null
                || user.PasswordResetTokenExpiresAt < DateTimeOffset.UtcNow
                || !CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(HashToken(token)),
                    Encoding.UTF8.GetBytes(user.PasswordResetTokenHash)))
            {
                return new AuthResetTokenInvalid();
            }

            user.PasswordHash = PasswordHasher.Hash(newPassword);
            user.PasswordResetTokenHash = null;
            user.PasswordResetTokenExpiresAt = null;
            await db.SaveChangesAsync();

            return new AuthSuccess { User = ToResponse(user) };
        }

        private static string HashToken(string token) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

        public async Task<AuthOutcome> ExternalLoginAsync(string googleId, string? email, string? displayName, Guid? claimGuestUserId = null)
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

            if (user == null && claimGuestUserId is Guid guestId)
            {
                // Upgrade the current guest row in place so their feeds/articles carry over.
                user = await db.Users.FirstOrDefaultAsync(u => u.Id == guestId && u.IsGuest);
                if (user != null)
                {
                    user.Username = await GenerateUniqueUsernameAsync(db, displayName ?? email ?? "user");
                    user.Email = email;
                    user.GoogleId = googleId;
                    user.IsGuest = false;
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

        private static UserResponse ToResponse(User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            IsGuest = user.IsGuest,
            AvatarUrl = user.AvatarUrl,
            CoverUrl = user.CoverUrl,
            Bio = user.Bio,
            SocialLinks = SocialLinkSerializer.Deserialize(user.SocialLinksJson),
        };
    }
}
