using Dtos;

namespace Services
{
    public abstract class PostOutcome { }
    public class PostSuccess : PostOutcome { public PostResponse Post { get; set; } = new(); }
    public class ThreadSuccess : PostOutcome { public ThreadResponse Thread { get; set; } = new(); }
    public class PostContentInvalid : PostOutcome { public string Message { get; set; } = "Post content must be between 1 and 280 characters."; }
    public class PostParentNotFound : PostOutcome { public string Message { get; set; } = "The post you're replying to no longer exists."; }
    public class PostNotFound : PostOutcome { }
    public class LikeSuccess : PostOutcome { public bool Liked { get; set; } public int LikeCount { get; set; } }
}
