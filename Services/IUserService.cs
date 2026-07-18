using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IUserService
    {
        Task<UserResponse?> GetByIdAsync(Guid userId, Guid? viewerId = null);
        Task<UserResponse?> GetByUsernameAsync(string username, Guid? viewerId = null);
        Task<UserResponse> UpdateAvatarAsync(Guid userId, string avatarUrl);
        Task<UserResponse> UpdateCoverAsync(Guid userId, string coverUrl);
        Task<UserResponse> RemoveAvatarAsync(Guid userId);
        Task<UserResponse> RemoveCoverAsync(Guid userId);
        Task<ProfileOutcome> UpdateProfileAsync(Guid userId, string username, string? bio, List<SocialLinkDto>? socialLinks);
    }
}
