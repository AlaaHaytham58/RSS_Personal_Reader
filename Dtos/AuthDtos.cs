using System;

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

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = "";
    }
}
