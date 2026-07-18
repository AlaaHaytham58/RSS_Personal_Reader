using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services
{
    public interface IPostService
    {
        Task<PostOutcome> CreatePostAsync(Guid authorId, string content, Guid? parentPostId, string? imageUrl = null, string? fileUrl = null, string? fileName = null);
        Task<List<Dtos.PostResponse>> GetTimelineAsync(int page, int pageSize, Guid? currentUserId);
        Task<List<Dtos.PostResponse>> GetPostsByAuthorAsync(Guid authorId, int page, int pageSize, Guid? currentUserId);
        Task<PostOutcome> GetThreadAsync(Guid postId, Guid? currentUserId);
        Task<PostOutcome> ToggleReactionAsync(Guid userId, Guid postId, Domain.ReactionType reactionType);
        Task<PostOutcome> DeletePostAsync(Guid userId, Guid postId);
        Task<PostOutcome> EditPostAsync(Guid userId, Guid postId, string content);
    }
}
