using System.Collections.Generic;

namespace Dtos
{
    public class ChatMessage
    {
        public string Role { get; set; } = "user";
        public string Content { get; set; } = "";
    }

    public class ChatRequest
    {
        public List<ChatMessage> Messages { get; set; } = new();
    }

    public class ChatResponse
    {
        public string Reply { get; set; } = "";
    }
}
