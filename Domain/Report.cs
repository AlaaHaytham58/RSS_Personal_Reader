using System;

namespace Domain
{
    public class Report
    {
        public Guid Id { get; set; }
        public Guid ReporterId { get; set; }
        public Guid ReportedUserId { get; set; }
        public string? Reason { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
