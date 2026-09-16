namespace JobTracker.Api.Models;

public enum ApplicationStatus
{
    Draft,
    ToApply,
    Applied,
    Interviewing,
    Assignment,
    Offer,
    Rejected,
    Ghosted,
    Withdrawn
}
