using System.ComponentModel.DataAnnotations;
using JobTracker.Api.Models;

namespace JobTracker.Api.DTOs;

public sealed class CreateApplicationEventRequest : IValidatableObject
{
    [Required, EnumDataType(typeof(ApplicationEventType))]
    public ApplicationEventType? Type { get; init; }
    [Required]
    public DateTimeOffset? OccurredAt { get; init; }
    public DateTimeOffset? DueAt { get; init; }
    [MaxLength(4000)]
    public string? Note { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Type is ApplicationEventType.ApplicationCreated or ApplicationEventType.StatusChanged)
            yield return new("This event is recorded automatically by application CRUD.", [nameof(Type)]);
        if (OccurredAt is { } occurred && (occurred == DateTimeOffset.MinValue || occurred > DateTimeOffset.UtcNow))
            yield return new("OccurredAt must be a known time in the past or present.", [nameof(OccurredAt)]);
        if (Type == ApplicationEventType.InterviewScheduled && DueAt is null)
            yield return new("An interview date and time is required.", [nameof(DueAt)]);
        if (DueAt is not null && Type is not (ApplicationEventType.InterviewScheduled or ApplicationEventType.AssignmentReceived or ApplicationEventType.OfferReceived))
            yield return new("This event does not accept a scheduled date or deadline.", [nameof(DueAt)]);
        if (DueAt is { } due && OccurredAt is { } start && due < start)
            yield return new("The scheduled date or deadline cannot precede the event.", [nameof(DueAt)]);
    }
}
