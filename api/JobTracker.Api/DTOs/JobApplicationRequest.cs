using System.ComponentModel.DataAnnotations;
using JobTracker.Api.Models;

namespace JobTracker.Api.DTOs;

public abstract class JobApplicationRequest
{
    [Required]
    public string CompanyName { get; init; } = string.Empty;

    [Required]
    public string JobTitle { get; init; } = string.Empty;

    public string? JobUrl { get; init; }
    public string? Location { get; init; }
    public string? Source { get; init; }

    [EnumDataType(typeof(ApplicationStatus))]
    public ApplicationStatus Status { get; init; } = ApplicationStatus.Draft;

    public DateOnly? AppliedDate { get; init; }
    public DateOnly? Deadline { get; init; }
    public string? SalaryRange { get; init; }
    public string? Notes { get; init; }
    public string? JobDescription { get; init; }
}
