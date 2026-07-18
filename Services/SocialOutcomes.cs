namespace Services
{
    public abstract class FollowOutcome { }
    public class FollowSuccess : FollowOutcome { public int FollowerCount { get; set; } public bool IsFollowing { get; set; } }
    public class FollowUserNotFound : FollowOutcome { }
    public class FollowSelfError : FollowOutcome { public string Message { get; set; } = "You can't follow yourself."; }
    public class FollowBlockedError : FollowOutcome { public string Message { get; set; } = "You can't follow this user."; }

    public abstract class BlockOutcome { }
    public class BlockSuccess : BlockOutcome { public bool IsBlocked { get; set; } }
    public class BlockUserNotFound : BlockOutcome { }
    public class BlockSelfError : BlockOutcome { public string Message { get; set; } = "You can't block yourself."; }

    public abstract class ReportOutcome { }
    public class ReportSuccess : ReportOutcome { }
    public class ReportUserNotFound : ReportOutcome { }
    public class ReportSelfError : ReportOutcome { public string Message { get; set; } = "You can't report yourself."; }
}
