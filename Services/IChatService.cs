using System.Collections.Generic;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IChatService
    {
        Task<ChatOutcome> AskAsync(List<ChatMessage> messages);
    }
}
