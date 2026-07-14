using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface ISummaryService
    {
        Task<DailySummaryResponse?> GetDailySummaryAsync();
        Task<DailySummaryResponse?> RefreshDailySummaryAsync();
    }
}
