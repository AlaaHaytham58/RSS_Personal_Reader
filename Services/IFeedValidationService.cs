using System;
using System.Threading.Tasks;

namespace Services
{
    public interface IFeedValidationService
    {
        Task<bool> IsValidUrlAsync(Guid userId, string url);
    }
}
