using JobTracker.Api.Models;

namespace JobTracker.Api.DTOs;

public sealed record JobApplicationResponse(
    Guid Id,
    string CompanyName,
    string JobTitle,
    string? JobUrl,
    string? Location,
    string? Source,
    ApplicationStatus Status,
    DateOnly? AppliedDate,
    DateOnly? Deadline,
    string? SalaryRange,
    string? Notes,
    string? JobDescription,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<ApplicationEventResponse> Events)
{
    public static JobApplicationResponse FromEntity(JobApplication application) => new(
        application.Id,
        application.CompanyName,
        application.JobTitle,
        application.JobUrl,
        application.Location,
        application.Source,
        application.Status,
        application.AppliedDate,
        application.Deadline,
        application.SalaryRange,
        application.Notes,
        application.JobDescription,
        application.CreatedAt,
        application.UpdatedAt,
        application.Events.OrderByDescending(item => item.OccurredAt).ThenByDescending(item => item.CreatedAt)
            .ThenBy(item => item.Id).Select(ApplicationEventResponse.FromEntity).ToList());
}
