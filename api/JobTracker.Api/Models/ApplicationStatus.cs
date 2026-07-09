namespace JobTracker.Api.Models;

public enum ApplicationStatus
{
    Draft = 0,
    ToApply = 1,
    Applied = 2,
    Interviewing = 3,
    Assignment = 4,
    Offer = 5,
    Rejected = 6,
    Ghosted = 7,
    Withdrawn = 8
}
