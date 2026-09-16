using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/applications/{applicationId:guid}/events")]
public sealed class ApplicationEventsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<JobApplicationResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JobApplicationResponse>> Create(Guid applicationId,
        CreateApplicationEventRequest request, CancellationToken cancellationToken)
    {
        var application = await db.JobApplications.Include(item => item.Events)
            .SingleOrDefaultAsync(item => item.Id == applicationId && item.UserId == "dev-user", cancellationToken);
        if (application is null) return NotFound();

        var type = request.Type!.Value;
        if (type == ApplicationEventType.ApplicationSent && application.Events.Any(item => item.Type == type))
            ModelState.AddModelError(nameof(request.Type), "Application sent is already recorded. Correct the applied date in Edit instead.");
        if (type == ApplicationEventType.FollowUpSent && application.Status != ApplicationStatus.Applied)
            ModelState.AddModelError(nameof(request.Type), "Follow-up is supported while Applied.");
        if (type == ApplicationEventType.AssignmentSubmitted && application.Status != ApplicationStatus.Assignment)
            ModelState.AddModelError(nameof(request.Type), "An assignment can only be submitted while in Assignment.");
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var now = DateTime.UtcNow;
        var previousStatus = application.Status;
        application.Status = type switch
        {
            ApplicationEventType.ApplicationSent => ApplicationStatus.Applied,
            ApplicationEventType.InterviewScheduled => ApplicationStatus.Interviewing,
            ApplicationEventType.AssignmentReceived => ApplicationStatus.Assignment,
            ApplicationEventType.OfferReceived => ApplicationStatus.Offer,
            _ => application.Status
        };
        ApplicationWorkflow.RecordStatusChange(application, previousStatus, now);
        ApplicationWorkflow.AddEvent(application, type, request.OccurredAt!.Value.UtcDateTime,
            now, request.DueAt?.UtcDateTime, request.Note);
        if (type == ApplicationEventType.ApplicationSent)
            application.AppliedDate = DateOnly.FromDateTime(request.OccurredAt.Value.UtcDateTime);
        application.UpdatedAt = now;
        await db.SaveChangesAsync(cancellationToken);

        // Return the updated aggregate so the existing list/detail caches stay aligned.
        return CreatedAtAction(nameof(ApplicationsController.GetById), "Applications",
            new { id = application.Id }, JobApplicationResponse.FromEntity(application));
    }
}
