using System;

namespace Dtos
{
    public class UserSearchResult
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = "";
        public string? AvatarUrl { get; set; }
        public bool IsFollowedByViewer { get; set; }
    }

    public class ReportUserRequest
    {
        public string? Reason { get; set; }
    }
}
