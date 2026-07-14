using Microsoft.AspNetCore.SignalR;

namespace Hubs
{
    // Server pushes only (new posts/replies); no client-invokable methods needed yet.
    public class CommunityHub : Hub
    {
    }
}
