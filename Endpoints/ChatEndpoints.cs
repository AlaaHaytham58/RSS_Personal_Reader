using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Dtos;
using Services;

namespace Endpoints
{
    public static class ChatEndpoints
    {
        public static void MapChatEndpoints(this WebApplication app)
        {
            app.MapPost("/api/chat", async (ChatRequest req, IChatService chatSvc) =>
            {
                if (req == null || req.Messages == null || req.Messages.Count == 0)
                {
                    return Results.BadRequest(new { error = "At least one message is required" });
                }

                var outcome = await chatSvc.AskAsync(req.Messages);
                return outcome switch
                {
                    ChatSuccess s => Results.Ok(new ChatResponse { Reply = s.Reply }),
                    ChatNotConfigured n => Results.UnprocessableEntity(new { error = n.Message }),
                    ChatUpstreamError u => Results.StatusCode(502),
                    _ => Results.StatusCode(500)
                };
            });
        }
    }
}
