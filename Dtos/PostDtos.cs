using System;
using Domain;

namespace Dtos
{
    public class CreatePostRequest
    {
        public string Content { get; set; } = "";
        public Guid? ParentPostId { get; set; }
        public string? ImageUrl { get; set; }
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
    }

    public class EditPostRequest
    {
        public string Content { get; set; } = "";
    }

    public class ReactToPostRequest
    {
        public ReactionType ReactionType { get; set; }
    }

    public class PostResponse
    {
        public Guid Id { get; set; }
        public string AuthorUsername { get; set; } = "";
        public string? AuthorAvatarUrl { get; set; }
        public string Content { get; set; } = "";
        public string? ImageUrl { get; set; }
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public Guid? ParentPostId { get; set; }
        public int ReplyCount { get; set; }
        public System.Collections.Generic.Dictionary<string, int> ReactionCounts { get; set; } = new();
        public string? CurrentUserReaction { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class ThreadResponse
    {
        public PostResponse Post { get; set; } = new();
        public System.Collections.Generic.List<PostResponse> Replies { get; set; } = new();
    }
}
