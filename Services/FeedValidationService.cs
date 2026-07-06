using System.Threading.Tasks;
using Validation;
using Infrastructure.Storage;

namespace Services
{
    public class FeedValidationService : IFeedValidationService
    {
        private readonly IFeedRepository _repo;

        public FeedValidationService(IFeedRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool> IsValidUrlAsync(string url)
        {
            if (!FeedUrlValidator.IsValid(url)) return false;

            // Check duplicate by URL (case-insensitive)
            var all = await _repo.GetAllFeedsAsync();
            var exists = all.Exists(f => string.Equals(f.Url.TrimEnd('/'), url.TrimEnd('/'), System.StringComparison.OrdinalIgnoreCase));
            return !exists;
        }
    }
}
