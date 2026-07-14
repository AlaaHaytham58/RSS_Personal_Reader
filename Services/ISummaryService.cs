using System;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface ISummaryService
    {
        Task<DailySummaryResponse?> GetDailySummaryAsync(Guid userId);
        Task<DailySummaryResponse?> RefreshDailySummaryAsync(Guid userId);
    }
}
