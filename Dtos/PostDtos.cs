using System;

namespace Dtos
{
    public class CreatePostRequest
    {
        public string Content { get; set; } = "";
        public Guid? ParentPostId { get; set; }
    }

    public class PostResponse
    {
        public Guid Id { get; set; }
        public string AuthorUsername { get; set; } = "";
        public string Content { get; set; } = "";
        public Guid? ParentPostId { get; set; }
        public int ReplyCount { get; set; }
        public int LikeCount { get; set; }
        public bool LikedByCurrentUser { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class ThreadResponse
    {
        public PostResponse Post { get; set; } = new();
        public System.Collections.Generic.List<PostResponse> Replies { get; set; } = new();
    }
}
