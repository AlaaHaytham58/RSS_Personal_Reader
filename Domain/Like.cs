using System;

namespace Domain
{
    public class Like
    {
        public Guid PostId { get; set; }
        public Guid UserId { get; set; }
        public ReactionType ReactionType { get; set; } = ReactionType.Like;
        public DateTimeOffset CreatedAt { get; set; }
    }
}
