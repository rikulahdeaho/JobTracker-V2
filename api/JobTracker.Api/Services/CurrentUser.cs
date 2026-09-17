using System.Security.Claims;

namespace JobTracker.Api.Services;

public sealed class CurrentUser(IHttpContextAccessor accessor)
{
    public string Id => accessor.HttpContext?.User.FindFirstValue("sub")
        ?? throw new InvalidOperationException("An authenticated subject is required.");
}
