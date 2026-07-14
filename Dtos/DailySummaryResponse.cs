using System;

namespace Dtos
{
    public class DailySummaryResponse
    {
        public string Content { get; set; } = string.Empty;
        public DateTimeOffset GeneratedAt { get; set; }
    }
}
