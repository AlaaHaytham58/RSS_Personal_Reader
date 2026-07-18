using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Dtos;
using Hubs;
using Infrastructure.Storage;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class PostService : IPostService
    {
        private const int MaxContentLength = 280;

        private readonly IDbContextFactory<AppDbContext> _contextFactory;
        private readonly IHubContext<CommunityHub> _hub;

        public PostService(IDbContextFactory<AppDbContext> contextFactory, IHubContext<CommunityHub> hub)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
            _hub = hub ?? throw new ArgumentNullException(nameof(hub));
        }

        public async Task<PostOutcome> CreatePostAsync(Guid authorId, string content, Guid? parentPostId, string? imageUrl = null, string? fileUrl = null, string? fileName = null)
        {
            content = content?.Trim() ?? "";
            imageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl;
            fileUrl = string.IsNullOrWhiteSpace(fileUrl) ? null : fileUrl;
            fileName = string.IsNullOrWhiteSpace(fileName) ? null : fileName;
            if ((content.Length == 0 && imageUrl == null && fileUrl == null) || content.Length > MaxContentLength)
            {
                return new PostContentInvalid();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            if (parentPostId.HasValue)
            {
                var parentExists = await db.Posts.AnyAsync(p => p.Id == parentPostId.Value);
                if (!parentExists)
                {
                    return new PostParentNotFound();
                }
            }

            var author = await db.Users.FirstOrDefaultAsync(u => u.Id == authorId);
            if (author == null)
            {
                return new PostParentNotFound();
            }

            var post = new Post
            {
                Id = Guid.NewGuid(),
                AuthorId = authorId,
                Content = content,
                ImageUrl = imageUrl,
                FileUrl = fileUrl,
                FileName = fileUrl != null ? fileName : null,
                ParentPostId = parentPostId,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Posts.Add(post);
            await db.SaveChangesAsync();

            var response = new PostResponse
            {
                Id = post.Id,
                AuthorUsername = author.Username,
                AuthorAvatarUrl = author.AvatarUrl,
                Content = post.Content,
                ImageUrl = post.ImageUrl,
                FileUrl = post.FileUrl,
                FileName = post.FileName,
                ParentPostId = post.ParentPostId,
                ReplyCount = 0,
                ReactionCounts = new Dictionary<string, int>(),
                CurrentUserReaction = null,
                CreatedAt = post.CreatedAt,
            };

            await _hub.Clients.All.SendAsync("NewPost", response);

            return new PostSuccess { Post = response };
        }

        public async Task<List<PostResponse>> GetTimelineAsync(int page, int pageSize, Guid? currentUserId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var (users, replyCounts, reactionCounts, currentUserReactions) = await LoadLookupsAsync(db, currentUserId);

            // SQLite can't ORDER BY DateTimeOffset server-side, so sort client-side after fetching.
            var roots = (await db.Posts.AsNoTracking().Where(p => p.ParentPostId == null).ToListAsync())
                .OrderByDescending(p => p.CreatedAt)
                .Skip(Math.Max(0, page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return roots.Select(p => ToResponse(p, users, replyCounts, reactionCounts, currentUserReactions)).ToList();
        }

        public async Task<List<PostResponse>> GetPostsByAuthorAsync(Guid authorId, int page, int pageSize, Guid? currentUserId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var (users, replyCounts, reactionCounts, currentUserReactions) = await LoadLookupsAsync(db, currentUserId);

            var posts = (await db.Posts.AsNoTracking().Where(p => p.AuthorId == authorId && p.ParentPostId == null).ToListAsync())
                .OrderByDescending(p => p.CreatedAt)
                .Skip(Math.Max(0, page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return posts.Select(p => ToResponse(p, users, replyCounts, reactionCounts, currentUserReactions)).ToList();
        }

        public async Task<PostOutcome> GetThreadAsync(Guid postId, Guid? currentUserId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var post = await db.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
            {
                return new PostNotFound();
            }

            var (users, replyCounts, reactionCounts, currentUserReactions) = await LoadLookupsAsync(db, currentUserId);

            var replies = (await db.Posts.AsNoTracking().Where(p => p.ParentPostId == postId).ToListAsync())
                .OrderBy(p => p.CreatedAt)
                .Select(p => ToResponse(p, users, replyCounts, reactionCounts, currentUserReactions))
                .ToList();

            return new ThreadSuccess
            {
                Thread = new ThreadResponse
                {
                    Post = ToResponse(post, users, replyCounts, reactionCounts, currentUserReactions),
                    Replies = replies,
                },
            };
        }

        public async Task<PostOutcome> ToggleReactionAsync(Guid userId, Guid postId, ReactionType reactionType)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var postExists = await db.Posts.AnyAsync(p => p.Id == postId);
            if (!postExists)
            {
                return new PostNotFound();
            }

            var existing = await db.Likes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
            ReactionType? currentReaction;
            if (existing != null && existing.ReactionType == reactionType)
            {
                // Reacting again with the same type clears it (toggle off).
                db.Likes.Remove(existing);
                currentReaction = null;
            }
            else if (existing != null)
            {
                // A user can only hold one reaction per post; switching type replaces the row.
                existing.ReactionType = reactionType;
                currentReaction = reactionType;
            }
            else
            {
                db.Likes.Add(new Like { PostId = postId, UserId = userId, ReactionType = reactionType, CreatedAt = DateTimeOffset.UtcNow });
                currentReaction = reactionType;
            }

            await db.SaveChangesAsync();

            var reactionCounts = await GetReactionCountsAsync(db, postId);

            await _hub.Clients.All.SendAsync("PostReacted", new { postId, reactionCounts });

            return new ReactionSuccess { ReactionCounts = reactionCounts, CurrentUserReaction = currentReaction };
        }

        public async Task<PostOutcome> DeletePostAsync(Guid userId, Guid postId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
            {
                return new PostNotFound();
            }

            if (post.AuthorId != userId)
            {
                return new PostForbidden();
            }

            var replies = await db.Posts.Where(p => p.ParentPostId == postId).ToListAsync();
            if (replies.Count > 0)
            {
                db.Posts.RemoveRange(replies);
            }

            db.Posts.Remove(post);
            await db.SaveChangesAsync();

            await _hub.Clients.All.SendAsync("PostDeleted", new { postId, parentPostId = post.ParentPostId });

            return new PostDeleted();
        }

        public async Task<PostOutcome> EditPostAsync(Guid userId, Guid postId, string content)
        {
            content = content?.Trim() ?? "";
            if (content.Length == 0 || content.Length > MaxContentLength)
            {
                return new PostContentInvalid();
            }

            await using var db = await _contextFactory.CreateDbContextAsync();

            var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
            {
                return new PostNotFound();
            }

            if (post.AuthorId != userId)
            {
                return new PostForbidden();
            }

            post.Content = content;
            await db.SaveChangesAsync();

            var author = await db.Users.FirstOrDefaultAsync(u => u.Id == post.AuthorId);
            var replyCount = await db.Posts.CountAsync(p => p.ParentPostId == postId);
            var reactionCounts = await GetReactionCountsAsync(db, postId);
            var currentUserReaction = await db.Likes.Where(l => l.PostId == postId && l.UserId == userId).Select(l => (ReactionType?)l.ReactionType).FirstOrDefaultAsync();

            var response = new PostResponse
            {
                Id = post.Id,
                AuthorUsername = author?.Username ?? "unknown",
                AuthorAvatarUrl = author?.AvatarUrl,
                Content = post.Content,
                ImageUrl = post.ImageUrl,
                FileUrl = post.FileUrl,
                FileName = post.FileName,
                ParentPostId = post.ParentPostId,
                ReplyCount = replyCount,
                ReactionCounts = reactionCounts,
                CurrentUserReaction = currentUserReaction?.ToString(),
                CreatedAt = post.CreatedAt,
            };

            await _hub.Clients.All.SendAsync("PostEdited", response);

            return new PostEdited { Post = response };
        }

        private static async Task<Dictionary<string, int>> GetReactionCountsAsync(AppDbContext db, Guid postId)
        {
            return await db.Likes.AsNoTracking()
                .Where(l => l.PostId == postId)
                .GroupBy(l => l.ReactionType)
                .Select(g => new { g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Key.ToString(), x => x.Count);
        }

        private static async Task<(Dictionary<Guid, (string Username, string? AvatarUrl)> Users, Dictionary<Guid, int> ReplyCounts, Dictionary<Guid, Dictionary<string, int>> ReactionCounts, Dictionary<Guid, ReactionType> CurrentUserReactions)> LoadLookupsAsync(AppDbContext db, Guid? currentUserId)
        {
            var users = await db.Users.AsNoTracking().ToDictionaryAsync(u => u.Id, u => (u.Username, u.AvatarUrl));

            var replyCounts = await db.Posts.AsNoTracking()
                .Where(p => p.ParentPostId != null)
                .GroupBy(p => p.ParentPostId!.Value)
                .Select(g => new { ParentId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ParentId, x => x.Count);

            var reactionRows = await db.Likes.AsNoTracking()
                .GroupBy(l => new { l.PostId, l.ReactionType })
                .Select(g => new { g.Key.PostId, g.Key.ReactionType, Count = g.Count() })
                .ToListAsync();

            var reactionCounts = reactionRows
                .GroupBy(r => r.PostId)
                .ToDictionary(g => g.Key, g => g.ToDictionary(r => r.ReactionType.ToString(), r => r.Count));

            var currentUserReactions = currentUserId.HasValue
                ? await db.Likes.AsNoTracking().Where(l => l.UserId == currentUserId.Value).ToDictionaryAsync(l => l.PostId, l => l.ReactionType)
                : new Dictionary<Guid, ReactionType>();

            return (users, replyCounts, reactionCounts, currentUserReactions);
        }

        private static PostResponse ToResponse(Post post, Dictionary<Guid, (string Username, string? AvatarUrl)> users, Dictionary<Guid, int> replyCounts, Dictionary<Guid, Dictionary<string, int>> reactionCounts, Dictionary<Guid, ReactionType> currentUserReactions)
        {
            var currentUserReaction = currentUserReactions.TryGetValue(post.Id, out var reaction) ? reaction.ToString() : null;
            return new()
            {
                Id = post.Id,
                AuthorUsername = users.TryGetValue(post.AuthorId, out var author) ? author.Username : "unknown",
                AuthorAvatarUrl = users.TryGetValue(post.AuthorId, out var author2) ? author2.AvatarUrl : null,
                Content = post.Content,
                ImageUrl = post.ImageUrl,
                FileUrl = post.FileUrl,
                FileName = post.FileName,
                ParentPostId = post.ParentPostId,
                ReplyCount = replyCounts.TryGetValue(post.Id, out var count) ? count : 0,
                ReactionCounts = reactionCounts.TryGetValue(post.Id, out var counts) ? counts : new Dictionary<string, int>(),
                CurrentUserReaction = currentUserReaction,
                CreatedAt = post.CreatedAt,
            };
        }
    }
}
