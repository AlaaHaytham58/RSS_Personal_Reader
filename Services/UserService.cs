using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Dtos;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class UserService : IUserService
    {
        private const int MinUsernameLength = 3;
        private const int MaxUsernameLength = 32;
        private const int MaxBioLength = 280;
        private const int MaxSocialLinks = 8;

        private static readonly HashSet<string> KnownPlatforms = new(StringComparer.OrdinalIgnoreCase)
        {
            "facebook", "twitter", "instagram", "youtube", "tiktok", "linkedin", "github",
        };

        private readonly IDbContextFactory<AppDbContext> _contextFactory;

        public UserService(IDbContextFactory<AppDbContext> contextFactory)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        }

        public async Task<UserResponse?> GetByIdAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            return user is null ? null : ToResponse(user);
        }

        public async Task<UserResponse?> GetByUsernameAsync(string username)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
            return user is null ? null : ToResponse(user);
        }

        public async Task<UserResponse> UpdateAvatarAsync(Guid userId, string avatarUrl)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var user = await db.Users.FirstAsync(u => u.Id == userId);
            user.AvatarUrl = avatarUrl;
            await db.SaveChangesAsync();
            return ToResponse(user);
        }

        public async Task<UserResponse> UpdateCoverAsync(Guid userId, string coverUrl)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var user = await db.Users.FirstAsync(u => u.Id == userId);
            user.CoverUrl = coverUrl;
            await db.SaveChangesAsync();
            return ToResponse(user);
        }

        public async Task<UserResponse> RemoveAvatarAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var user = await db.Users.FirstAsync(u => u.Id == userId);
            user.AvatarUrl = null;
            await db.SaveChangesAsync();
            return ToResponse(user);
        }

        public async Task<UserResponse> RemoveCoverAsync(Guid userId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var user = await db.Users.FirstAsync(u => u.Id == userId);
            user.CoverUrl = null;
            await db.SaveChangesAsync();
            return ToResponse(user);
        }

        public async Task<ProfileOutcome> UpdateProfileAsync(Guid userId, string username, string? bio, List<SocialLinkDto>? socialLinks)
        {
            username = username?.Trim() ?? "";
            if (username.Length < MinUsernameLength || username.Length > MaxUsernameLength)
            {
                return new ProfileValidationError { Message = $"Username must be {MinUsernameLength}-{MaxUsernameLength} characters." };
            }

            bio = bio?.Trim() ?? "";
            if (bio.Length > MaxBioLength)
            {
                return new ProfileValidationError { Message = $"Bio must be {MaxBioLength} characters or fewer." };
            }

            var cleanedLinks = new List<SocialLinkDto>();
            foreach (var link in socialLinks ?? new List<SocialLinkDto>())
            {
                if (cleanedLinks.Count >= MaxSocialLinks) break;

                var url = link.Url?.Trim() ?? "";
                if (url.Length == 0) continue;
                if (!url.Contains("://", StringComparison.Ordinal))
                {
                    url = "https://" + url;
                }

                // Only http(s) is accepted so a crafted "javascript:" or "data:" URL can
                // never end up rendered as a clickable link on someone's profile.
                if (!Uri.TryCreate(url, UriKind.Absolute, out var parsed)
                    || (parsed.Scheme != Uri.UriSchemeHttp && parsed.Scheme != Uri.UriSchemeHttps))
                {
                    return new ProfileValidationError { Message = $"\"{link.Url}\" is not a valid http(s) link." };
                }

                var platform = link.Platform?.Trim().ToLowerInvariant() ?? "";
                if (!KnownPlatforms.Contains(platform))
                {
                    platform = "website";
                }

                cleanedLinks.Add(new SocialLinkDto { Platform = platform, Url = parsed.ToString() });
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var exists = await db.Users.AnyAsync(u => u.Username == username && u.Id != userId);
            if (exists)
            {
                return new ProfileUsernameTaken();
            }

            var user = await db.Users.FirstAsync(u => u.Id == userId);
            user.Username = username;
            user.Bio = bio.Length == 0 ? null : bio;
            user.SocialLinksJson = SocialLinkSerializer.Serialize(cleanedLinks);
            await db.SaveChangesAsync();

            return new ProfileSuccess { User = ToResponse(user) };
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
