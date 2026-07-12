namespace Services
{
    public abstract class ChatOutcome { }
    public class ChatSuccess : ChatOutcome { public string Reply { get; set; } = ""; }
    public class ChatNotConfigured : ChatOutcome { public string Message { get; set; } = "The AI assistant isn't set up yet. Please try again later."; }
    public class ChatUpstreamError : ChatOutcome { public string Message { get; set; } = "The AI assistant is unavailable right now."; }
}
