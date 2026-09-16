using JobTracker.Api.Models;

namespace JobTracker.Api.DTOs;

public sealed record ApplicationEventResponse(
    Guid Id, Guid ApplicationId, ApplicationEventType Type, DateTime OccurredAt,
    DateTime? DueAt, string? Note, ApplicationStatus? FromStatus,
    ApplicationStatus? ToStatus, DateTime CreatedAt)
{
    public static ApplicationEventResponse FromEntity(ApplicationEvent item) => new(
        item.Id, item.ApplicationId, item.Type, item.OccurredAt, item.DueAt,
        item.Note, item.FromStatus, item.ToStatus, item.CreatedAt);
}
