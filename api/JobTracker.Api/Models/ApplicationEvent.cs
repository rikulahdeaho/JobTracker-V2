namespace JobTracker.Api.Models;

public enum ApplicationEventType
{
    ApplicationCreated,
    ApplicationSent,
    StatusChanged,
    FollowUpSent,
    InterviewScheduled,
    AssignmentReceived,
    AssignmentSubmitted,
    OfferReceived,
    ContactReceived
}

public sealed class ApplicationEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ApplicationId { get; set; }
    public ApplicationEventType Type { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime? DueAt { get; set; }
    public string? Note { get; set; }
    public ApplicationStatus? FromStatus { get; set; }
    public ApplicationStatus? ToStatus { get; set; }
    public DateTime CreatedAt { get; set; }
}
