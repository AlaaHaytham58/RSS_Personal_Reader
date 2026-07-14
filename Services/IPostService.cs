using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services
{
    public interface IPostService
    {
        Task<PostOutcome> CreatePostAsync(Guid authorId, string content, Guid? parentPostId);
        Task<List<Dtos.PostResponse>> GetTimelineAsync(int page, int pageSize, Guid? currentUserId);
        Task<PostOutcome> GetThreadAsync(Guid postId, Guid? currentUserId);
        Task<PostOutcome> ToggleLikeAsync(Guid userId, Guid postId);
    }
}
