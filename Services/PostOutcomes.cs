using Dtos;

namespace Services
{
    public abstract class PostOutcome { }
    public class PostSuccess : PostOutcome { public PostResponse Post { get; set; } = new(); }
    public class ThreadSuccess : PostOutcome { public ThreadResponse Thread { get; set; } = new(); }
    public class PostContentInvalid : PostOutcome { public string Message { get; set; } = "Post content must be between 1 and 280 characters."; }
    public class PostParentNotFound : PostOutcome { public string Message { get; set; } = "The post you're replying to no longer exists."; }
    public class PostNotFound : PostOutcome { }
    public class PostForbidden : PostOutcome { }
    public class PostDeleted : PostOutcome { }
    public class PostEdited : PostOutcome { public PostResponse Post { get; set; } = new(); }
    public class ReactionSuccess : PostOutcome
    {
        public System.Collections.Generic.Dictionary<string, int> ReactionCounts { get; set; } = new();
        public Domain.ReactionType? CurrentUserReaction { get; set; }
    }
}
