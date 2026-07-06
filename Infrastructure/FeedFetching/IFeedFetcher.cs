using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.FeedFetching
{
    public interface IFeedFetcher
    {
        Task<FetchResult> FetchAsync(string url, CancellationToken ct);
    }
}
