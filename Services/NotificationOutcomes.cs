using Dtos;

namespace Services
{
    public abstract class NotificationOutcome { }
    public class NotificationsFetched : NotificationOutcome { public NotificationListResponse Result { get; set; } = new(); }
    public class NotificationMarkedRead : NotificationOutcome { }
    public class NotificationNotFound : NotificationOutcome { }
    public class NotificationForbidden : NotificationOutcome { }
}
