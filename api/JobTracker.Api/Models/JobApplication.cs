namespace JobTracker.Api.Models;

public sealed class JobApplication
{
    public List<ApplicationEvent> Events { get; set; } = [];
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string CompanyName { get; set; }
    public required string JobTitle { get; set; }
    public string? JobUrl { get; set; }
    public string? Location { get; set; }
    public string? Source { get; set; }
    public ApplicationMethod ApplicationMethod { get; set; } = ApplicationMethod.Unknown;
    public FollowUpMode FollowUpMode { get; set; } = FollowUpMode.Unknown;
    public string? ContactPerson { get; set; }
    public string? ContactEmail { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;
    public DateOnly? AppliedDate { get; set; }
    public DateOnly? Deadline { get; set; }
    public string? SalaryRange { get; set; }
    public string? Notes { get; set; }
    public string? JobDescription { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
