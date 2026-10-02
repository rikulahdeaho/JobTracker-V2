namespace JobTracker.Api.Models;

public enum ApplicationMethod
{
    Unknown,
    CompanyPortal,
    Email,
    RecruiterDirect,
    LinkedInEasyApply,
    Other
}

public enum FollowUpMode
{
    Unknown,
    Possible,
    NotAvailable,
    NotNeeded
}
