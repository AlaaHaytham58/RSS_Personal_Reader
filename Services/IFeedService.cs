using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain;

namespace Services
{
    public interface IFeedService
    {
        Task<AddFeedOutcome> AddFeedAsync(string url);
        Task<RefreshOutcome> RefreshFeedAsync(Guid feedId);
        Task<bool> RemoveFeedAsync(Guid feedId);
        Task<List<Feed>> GetAllFeedsAsync();
        // Optional: repository-backed implementations may expose a bulk add; kept here for completeness
        // (not required for callers of the service)
    }
}
