using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface ISocialService
    {
        Task<FollowOutcome> FollowAsync(Guid followerId, string targetUsername);
        Task<FollowOutcome> UnfollowAsync(Guid followerId, string targetUsername);
        Task<BlockOutcome> BlockAsync(Guid blockerId, string targetUsername);
        Task<BlockOutcome> UnblockAsync(Guid blockerId, string targetUsername);
        Task<ReportOutcome> ReportAsync(Guid reporterId, string targetUsername, string? reason);
        Task<List<UserSearchResult>> SearchUsersAsync(string query, Guid? viewerId, int limit = 10);
    }
}
