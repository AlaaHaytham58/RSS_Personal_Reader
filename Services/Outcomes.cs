using System;
using Domain;
using System.Collections.Generic;

namespace Services
{
    public abstract class AddFeedOutcome { }
    public class AddFeedSuccess : AddFeedOutcome { public Feed Feed { get; set; } = default!; }
    public class AddFeedInvalidUrl : AddFeedOutcome { public string Message { get; set; } = "Invalid URL"; }
    public class AddFeedAlreadyExists : AddFeedOutcome { public string Message { get; set; } = "Feed already exists"; }
    public class AddFeedUnreachable : AddFeedOutcome { public string Message { get; set; } = string.Empty; }
    public class AddFeedNotAFeed : AddFeedOutcome { public string Message { get; set; } = string.Empty; }

    public abstract class RefreshOutcome { }
    public class RefreshSuccess : RefreshOutcome { public Guid FeedId { get; set; } }
    public class RefreshNotFound : RefreshOutcome { public Guid FeedId { get; set; } }
    public class RefreshFailed : RefreshOutcome { public Guid FeedId { get; set; } public string Message { get; set; } = string.Empty; }
}
