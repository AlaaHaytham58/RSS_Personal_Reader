using System;

namespace Domain
{
    public class Post
    {
        public Guid Id { get; set; }
        public Guid AuthorId { get; set; }
        public string Content { get; set; } = string.Empty;

        // Relative /uploads/posts/... path; null if the post has no attached image.
        public string? ImageUrl { get; set; }

        // Relative /uploads/postfiles/... path plus the original filename for display; null if no file is attached.
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }

        // Null for a root post; set to the parent's Id for a reply.
        public Guid? ParentPostId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
