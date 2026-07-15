using System;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IAuthService
    {
        Task<AuthOutcome> RegisterAsync(string username, string password, Guid? claimGuestUserId = null);
        Task<AuthOutcome> ValidateCredentialsAsync(string username, string password);
        Task<AuthOutcome> ExternalLoginAsync(string googleId, string? email, string? displayName, Guid? claimGuestUserId = null);
        Task<UserResponse> CreateGuestAsync();
    }
}
