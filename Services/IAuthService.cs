using System;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IAuthService
    {
        Task<AuthOutcome> RegisterAsync(string username, string email, string password, Guid? claimGuestUserId = null);
        Task<AuthOutcome> ValidateCredentialsAsync(string usernameOrEmail, string password);
        Task<AuthOutcome> ExternalLoginAsync(string googleId, string? email, string? displayName, Guid? claimGuestUserId = null);
        Task<UserResponse> CreateGuestAsync();
        Task<AuthOutcome> ForgotPasswordAsync(string email, string baseUrl);
        Task<AuthOutcome> ResetPasswordAsync(string email, string token, string newPassword);
    }
}
