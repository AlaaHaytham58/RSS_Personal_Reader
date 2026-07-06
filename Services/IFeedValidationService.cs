using System.Threading.Tasks;

namespace Services
{
    public interface IFeedValidationService
    {
        Task<bool> IsValidUrlAsync(string url);
    }
}
