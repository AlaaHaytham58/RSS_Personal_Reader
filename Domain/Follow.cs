using System;

namespace Domain
{
    public class Follow
    {
        public Guid FollowerId { get; set; }
        public Guid FollowingId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
