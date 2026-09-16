using JobTracker.Api.Models;

namespace JobTracker.Api.Services;

// Changes are saved together with the application by the controller's SaveChanges.
public static class ApplicationWorkflow
{
    public static ApplicationEvent AddEvent(JobApplication application, ApplicationEventType type,
        DateTime occurredAt, DateTime createdAt, DateTime? dueAt = null, string? note = null)
    {
        var item = new ApplicationEvent
        {
            ApplicationId = application.Id, Type = type, OccurredAt = occurredAt,
            CreatedAt = createdAt, DueAt = dueAt, Note = note?.Trim()
        };
        application.Events.Add(item);
        return item;
    }

    public static void RecordStatusChange(JobApplication application, ApplicationStatus previous, DateTime now)
    {
        if (previous == application.Status) return;
        var item = AddEvent(application, ApplicationEventType.StatusChanged, now, now);
        item.FromStatus = previous;
        item.ToStatus = application.Status;
    }

    // AppliedDate is an editable date-only fact. Correct its single sent event rather
    // than inventing another submission. Other workflow events remain unchanged.
    public static void SynchronizeAppliedDate(JobApplication application, DateOnly? previous, DateTime now)
    {
        if (previous == application.AppliedDate) return;
        var sent = application.Events.SingleOrDefault(item => item.Type == ApplicationEventType.ApplicationSent);
        if (application.AppliedDate is { } date)
        {
            var occurredAt = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            if (sent is null) AddEvent(application, ApplicationEventType.ApplicationSent, occurredAt, now);
            else sent.OccurredAt = occurredAt;
        }
        else if (sent is not null) application.Events.Remove(sent);
    }
}
