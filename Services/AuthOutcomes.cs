using Dtos;

namespace Services
{
    public abstract class AuthOutcome { }
    public class AuthSuccess : AuthOutcome { public UserResponse User { get; set; } = new(); }
    public class AuthUsernameTaken : AuthOutcome { public string Message { get; set; } = "That username is already taken."; }
    public class AuthInvalidCredentials : AuthOutcome { public string Message { get; set; } = "Invalid username or password."; }
    public class AuthValidationError : AuthOutcome { public string Message { get; set; } = "Username and password are required."; }
}
