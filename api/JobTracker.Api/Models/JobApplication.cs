namespace JobTracker.Api.Models;

public class JobApplication
{
    public int Id { get; set; }

    public string UserId { get; set; } = "dev-user";

    public string CompanyName { get; set; } = "";
    public string JobTitle { get; set; } = "";
    public string? JobUrl { get; set; }
    public string? Location { get; set; }
    public string? Source { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;

    public DateTime? AppliedDate { get; set; }
    public DateTime? Deadline { get; set; }

    public string? SalaryRange { get; set; }
    public string? Notes { get; set; }
    public string? JobDescription { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
