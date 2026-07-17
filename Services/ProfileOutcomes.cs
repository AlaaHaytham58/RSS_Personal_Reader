using Dtos;

namespace Services
{
    public abstract class ProfileOutcome { }
    public class ProfileSuccess : ProfileOutcome { public UserResponse User { get; set; } = new(); }
    public class ProfileUsernameTaken : ProfileOutcome { public string Message { get; set; } = "That username is already taken."; }
    public class ProfileValidationError : ProfileOutcome { public string Message { get; set; } = "Please check your profile details."; }
}
