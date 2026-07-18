using System;

namespace Domain
{
    public class Block
    {
        public Guid BlockerId { get; set; }
        public Guid BlockedId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
