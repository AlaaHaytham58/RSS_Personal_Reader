using System;
using System.Collections.Generic;

namespace Dtos
{
    public class RegisterRequest
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginRequest
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class SocialLinkDto
    {
        public string Platform { get; set; } = "";
        public string Url { get; set; } = "";
    }

    public class UpdateProfileRequest
    {
        public string Username { get; set; } = "";
        public string? Bio { get; set; }
        public List<SocialLinkDto>? SocialLinks { get; set; }
    }

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = "";
        public bool IsGuest { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CoverUrl { get; set; }
        public string? Bio { get; set; }
        public List<SocialLinkDto> SocialLinks { get; set; } = new();
    }
}
