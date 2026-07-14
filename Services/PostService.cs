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
                CreatedAt = post.CreatedAt,
            };

            await _hub.Clients.All.SendAsync("NewPost", response);

            return new PostSuccess { Post = response };
        }

        public async Task<List<PostResponse>> GetTimelineAsync(int page, int pageSize)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var users = await db.Users.AsNoTracking().ToDictionaryAsync(u => u.Id, u => u.Username);
            var replyCounts = await db.Posts.AsNoTracking()
                .Where(p => p.ParentPostId != null)
                .GroupBy(p => p.ParentPostId!.Value)
                .Select(g => new { ParentId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ParentId, x => x.Count);

            // SQLite can't ORDER BY DateTimeOffset server-side, so sort client-side after fetching.
            var roots = (await db.Posts.AsNoTracking().Where(p => p.ParentPostId == null).ToListAsync())
                .OrderByDescending(p => p.CreatedAt)
                .Skip(Math.Max(0, page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return roots.Select(p => ToResponse(p, users, replyCounts)).ToList();
        }

        public async Task<PostOutcome> GetThreadAsync(Guid postId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();

            var post = await db.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
            {
                return new PostNotFound();
            }

            var users = await db.Users.AsNoTracking().ToDictionaryAsync(u => u.Id, u => u.Username);
            var replyCounts = await db.Posts.AsNoTracking()
                .Where(p => p.ParentPostId != null)
                .GroupBy(p => p.ParentPostId!.Value)
                .Select(g => new { ParentId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ParentId, x => x.Count);

            var replies = (await db.Posts.AsNoTracking().Where(p => p.ParentPostId == postId).ToListAsync())
                .OrderBy(p => p.CreatedAt)
                .Select(p => ToResponse(p, users, replyCounts))
                .ToList();

            return new ThreadSuccess
            {
                Thread = new ThreadResponse
                {
                    Post = ToResponse(post, users, replyCounts),
                    Replies = replies,
                },
            };
        }

        private static PostResponse ToResponse(Post post, Dictionary<Guid, string> users, Dictionary<Guid, int> replyCounts) => new()
        {
            Id = post.Id,
            AuthorUsername = users.TryGetValue(post.AuthorId, out var name) ? name : "unknown",
            Content = post.Content,
            ParentPostId = post.ParentPostId,
            ReplyCount = replyCounts.TryGetValue(post.Id, out var count) ? count : 0,
            CreatedAt = post.CreatedAt,
        };
    }
}
