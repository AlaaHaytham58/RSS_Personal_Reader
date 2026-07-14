using System.Threading.Tasks;

namespace Services
{
    public interface IAuthService
    {
        Task<AuthOutcome> RegisterAsync(string username, string password);
        Task<AuthOutcome> ValidateCredentialsAsync(string username, string password);
        Task<AuthOutcome> ExternalLoginAsync(string googleId, string? email, string? displayName);
    }
}
