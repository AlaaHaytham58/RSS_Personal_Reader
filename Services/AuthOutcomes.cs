using Dtos;

namespace Services
{
    public abstract class AuthOutcome { }
    public class AuthSuccess : AuthOutcome { public UserResponse User { get; set; } = new(); }
    public class AuthUsernameTaken : AuthOutcome { public string Message { get; set; } = "That username is already taken."; }
    public class AuthEmailTaken : AuthOutcome { public string Message { get; set; } = "That email is already registered."; }
    public class AuthEmailInvalid : AuthOutcome { public string Message { get; set; } = "Enter a valid email address."; }
    public class AuthInvalidCredentials : AuthOutcome { public string Message { get; set; } = "Invalid username or password."; }
    public class AuthValidationError : AuthOutcome { public string Message { get; set; } = "Username and password are required."; }
    public class AuthResetTokenInvalid : AuthOutcome { public string Message { get; set; } = "This reset link is invalid or has expired."; }
    public class ForgotPasswordAccepted : AuthOutcome { }
}
