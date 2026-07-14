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

        public async Task<PostOutcome> CreatePostAsync(Guid authorId, string content, Guid? parentPostId)
        {
            content = content?.Trim() ?? "";
            if (content.Length == 0 || content.Length > MaxContentLength)
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
                ParentPostId = parentPostId,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Posts.Add(post);
            await db.SaveChangesAsync();

            var response = new PostResponse
            {
                Id = post.Id,
                AuthorUsername = author.Username,
                Content = post.Content,
                ParentPostId = post.ParentPostId,
                ReplyCount = 0,
                LikeCount = 0,
                LikedByCurrentUser = false,
                CreatedAt = post.CreatedAt,
            };

            await _hub.Clients.All.SendAsync("NewPost", response);

            return new PostSuccess { Post = response };
        }

        public async Task<List<PostResponse>> GetTimelineAsync(int page, int pageSize, Guid? currentUserId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var (users, replyCounts, likeCounts, likedByCurrentUser) = await LoadLookupsAsync(db, currentUserId);

            // SQLite can't ORDER BY DateTimeOffset server-side, so sort client-side after fetching.
            var roots = (await db.Posts.AsNoTracking().Where(p => p.ParentPostId == null).ToListAsync())
                .OrderByDescending(p => p.CreatedAt)
                .Skip(Math.Max(0, page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return roots.Select(p => ToResponse(p, users, replyCounts, likeCounts, likedByCurrentUser)).ToList();
        }

        public async Task<PostOutcome> GetThreadAsync(Guid postId, Guid? currentUserId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var post = await db.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
            {
                return new PostNotFound();
            }

            var (users, replyCounts, likeCounts, likedByCurrentUser) = await LoadLookupsAsync(db, currentUserId);

            var replies = (await db.Posts.AsNoTracking().Where(p => p.ParentPostId == postId).ToListAsync())
                .OrderBy(p => p.CreatedAt)
                .Select(p => ToResponse(p, users, replyCounts, likeCounts, likedByCurrentUser))
                .ToList();

            return new ThreadSuccess
            {
                Thread = new ThreadResponse
                {
                    Post = ToResponse(post, users, replyCounts, likeCounts, likedByCurrentUser),
                    Replies = replies,
                },
            };
        }

        public async Task<PostOutcome> ToggleLikeAsync(Guid userId, Guid postId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var postExists = await db.Posts.AnyAsync(p => p.Id == postId);
            if (!postExists)
            {
                return new PostNotFound();
            }

            var existingLike = await db.Likes.FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
            bool liked;
            if (existingLike != null)
            {
                db.Likes.Remove(existingLike);
                liked = false;
            }
            else
            {
                db.Likes.Add(new Like { PostId = postId, UserId = userId, CreatedAt = DateTimeOffset.UtcNow });
                liked = true;
            }

            await db.SaveChangesAsync();

            var likeCount = await db.Likes.CountAsync(l => l.PostId == postId);

            await _hub.Clients.All.SendAsync("PostLiked", new { postId, likeCount });

            return new LikeSuccess { Liked = liked, LikeCount = likeCount };
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

        private static async Task<(Dictionary<Guid, string> Users, Dictionary<Guid, int> ReplyCounts, Dictionary<Guid, int> LikeCounts, HashSet<Guid> LikedByCurrentUser)> LoadLookupsAsync(AppDbContext db, Guid? currentUserId)
        {
            var users = await db.Users.AsNoTracking().ToDictionaryAsync(u => u.Id, u => u.Username);

            var replyCounts = await db.Posts.AsNoTracking()
                .Where(p => p.ParentPostId != null)
                .GroupBy(p => p.ParentPostId!.Value)
                .Select(g => new { ParentId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ParentId, x => x.Count);

            var likeCounts = await db.Likes.AsNoTracking()
                .GroupBy(l => l.PostId)
                .Select(g => new { PostId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.PostId, x => x.Count);

            var likedByCurrentUser = currentUserId.HasValue
                ? (await db.Likes.AsNoTracking().Where(l => l.UserId == currentUserId.Value).Select(l => l.PostId).ToListAsync()).ToHashSet()
                : new HashSet<Guid>();

            return (users, replyCounts, likeCounts, likedByCurrentUser);
        }

        private static PostResponse ToResponse(Post post, Dictionary<Guid, string> users, Dictionary<Guid, int> replyCounts, Dictionary<Guid, int> likeCounts, HashSet<Guid> likedByCurrentUser) => new()
        {
            Id = post.Id,
            AuthorUsername = users.TryGetValue(post.AuthorId, out var name) ? name : "unknown",
            Content = post.Content,
            ParentPostId = post.ParentPostId,
            ReplyCount = replyCounts.TryGetValue(post.Id, out var count) ? count : 0,
            LikeCount = likeCounts.TryGetValue(post.Id, out var likeCount) ? likeCount : 0,
            LikedByCurrentUser = likedByCurrentUser.Contains(post.Id),
            CreatedAt = post.CreatedAt,
        };
    }
}
