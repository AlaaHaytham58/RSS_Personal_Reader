using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dtos;

namespace Services
{
    public interface IChatService
    {
        Task<ChatOutcome> AskAsync(Guid userId, List<ChatMessage> messages);
        Task<ChatOutcome> GenerateDailySummaryAsync(Guid userId);
    }
}
