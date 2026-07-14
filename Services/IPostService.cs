using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services
{
    public interface IPostService
    {
        Task<PostOutcome> CreatePostAsync(Guid authorId, string content, Guid? parentPostId);
        Task<List<Dtos.PostResponse>> GetTimelineAsync(int page, int pageSize);
        Task<PostOutcome> GetThreadAsync(Guid postId);
    }
}
