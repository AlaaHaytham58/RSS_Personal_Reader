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
    public class SocialService : ISocialService
    {
        private readonly IDbContextFactory<AppDbContext> _contextFactory;

        public SocialService(IDbContextFactory<AppDbContext> contextFactory)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        }

        public async Task<FollowOutcome> FollowAsync(Guid followerId, string targetUsername)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var target = await db.Users.FirstOrDefaultAsync(u => u.Username == targetUsername);
            if (target is null) return new FollowUserNotFound();
            if (target.Id == followerId) return new FollowSelfError();

            var blocked = await db.Blocks.AsNoTracking().AnyAsync(b =>
                (b.BlockerId == followerId && b.BlockedId == target.Id) ||
                (b.BlockerId == target.Id && b.BlockedId == followerId));
            if (blocked) return new FollowBlockedError();

            var exists = await db.Follows.AnyAsync(f => f.FollowerId == followerId && f.FollowingId == target.Id);
            if (!exists)
            {
                db.Follows.Add(new Follow { FollowerId = followerId, FollowingId = target.Id, CreatedAt = DateTimeOffset.UtcNow });
                await db.SaveChangesAsync();
            }

            var followerCount = await db.Follows.AsNoTracking().CountAsync(f => f.FollowingId == target.Id);
            return new FollowSuccess { FollowerCount = followerCount, IsFollowing = true };
        }

        public async Task<FollowOutcome> UnfollowAsync(Guid followerId, string targetUsername)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var target = await db.Users.FirstOrDefaultAsync(u => u.Username == targetUsername);
            if (target is null) return new FollowUserNotFound();

            var follow = await db.Follows.FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == target.Id);
            if (follow is not null)
            {
                db.Follows.Remove(follow);
                await db.SaveChangesAsync();
            }

            var followerCount = await db.Follows.AsNoTracking().CountAsync(f => f.FollowingId == target.Id);
            return new FollowSuccess { FollowerCount = followerCount, IsFollowing = false };
        }

        public async Task<BlockOutcome> BlockAsync(Guid blockerId, string targetUsername)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var target = await db.Users.FirstOrDefaultAsync(u => u.Username == targetUsername);
            if (target is null) return new BlockUserNotFound();
            if (target.Id == blockerId) return new BlockSelfError();

            var exists = await db.Blocks.AnyAsync(b => b.BlockerId == blockerId && b.BlockedId == target.Id);
            if (!exists)
            {
                db.Blocks.Add(new Block { BlockerId = blockerId, BlockedId = target.Id, CreatedAt = DateTimeOffset.UtcNow });

                // Blocking severs any existing follow relationship in either direction.
                var follows = await db.Follows
                    .Where(f => (f.FollowerId == blockerId && f.FollowingId == target.Id) ||
                                (f.FollowerId == target.Id && f.FollowingId == blockerId))
                    .ToListAsync();
                db.Follows.RemoveRange(follows);

                await db.SaveChangesAsync();
            }

            return new BlockSuccess { IsBlocked = true };
        }

        public async Task<BlockOutcome> UnblockAsync(Guid blockerId, string targetUsername)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var target = await db.Users.FirstOrDefaultAsync(u => u.Username == targetUsername);
            if (target is null) return new BlockUserNotFound();

            var block = await db.Blocks.FirstOrDefaultAsync(b => b.BlockerId == blockerId && b.BlockedId == target.Id);
            if (block is not null)
            {
                db.Blocks.Remove(block);
                await db.SaveChangesAsync();
            }

            return new BlockSuccess { IsBlocked = false };
        }

        public async Task<ReportOutcome> ReportAsync(Guid reporterId, string targetUsername, string? reason)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var target = await db.Users.FirstOrDefaultAsync(u => u.Username == targetUsername);
            if (target is null) return new ReportUserNotFound();
            if (target.Id == reporterId) return new ReportSelfError();

            reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();

            db.Reports.Add(new Report
            {
                Id = Guid.NewGuid(),
                ReporterId = reporterId,
                ReportedUserId = target.Id,
                Reason = reason,
                CreatedAt = DateTimeOffset.UtcNow,
            });
            await db.SaveChangesAsync();

            return new ReportSuccess();
        }

        public async Task<List<UserSearchResult>> SearchUsersAsync(string query, Guid? viewerId, int limit = 10)
        {
            query = query?.Trim() ?? "";
            if (query.Length == 0) return new List<UserSearchResult>();

            limit = Math.Clamp(limit, 1, 25);

            await using var db = await _contextFactory.CreateDbContextAsync();
            var matches = await db.Users.AsNoTracking()
                .Where(u => !u.IsGuest && EF.Functions.Like(u.Username, $"%{query}%"))
                .OrderBy(u => u.Username)
                .Take(limit)
                .ToListAsync();

            if (viewerId.HasValue)
            {
                matches = matches.Where(u => u.Id != viewerId.Value).ToList();
            }

            var followedIds = new HashSet<Guid>();
            if (viewerId.HasValue && matches.Count > 0)
            {
                var matchIds = matches.Select(u => u.Id).ToList();
                followedIds = (await db.Follows.AsNoTracking()
                    .Where(f => f.FollowerId == viewerId.Value && matchIds.Contains(f.FollowingId))
                    .Select(f => f.FollowingId)
                    .ToListAsync()).ToHashSet();
            }

            return matches.Select(u => new UserSearchResult
            {
                Id = u.Id,
                Username = u.Username,
                AvatarUrl = u.AvatarUrl,
                IsFollowedByViewer = followedIds.Contains(u.Id),
            }).ToList();
        }
    }
}
