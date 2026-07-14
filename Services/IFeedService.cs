using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain;

namespace Services
{
    public interface IFeedService
    {
        Task<AddFeedOutcome> AddFeedAsync(Guid userId, string url);
        Task<RefreshOutcome> RefreshFeedAsync(Guid userId, Guid feedId);
        Task<bool> RemoveFeedAsync(Guid userId, Guid feedId);
        Task<List<Feed>> GetAllFeedsAsync(Guid userId);
        // Optional: repository-backed implementations may expose a bulk add; kept here for completeness
        // (not required for callers of the service)
    }
}
