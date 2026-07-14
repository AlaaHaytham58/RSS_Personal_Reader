using System;

namespace Domain
{
    public class Post
    {
        public Guid Id { get; set; }
        public Guid AuthorId { get; set; }
        public string Content { get; set; } = string.Empty;

        // Null for a root post; set to the parent's Id for a reply.
        public Guid? ParentPostId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
