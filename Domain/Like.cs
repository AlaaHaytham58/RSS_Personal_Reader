using System;

namespace Domain
{
    public class Like
    {
        public Guid PostId { get; set; }
        public Guid UserId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
