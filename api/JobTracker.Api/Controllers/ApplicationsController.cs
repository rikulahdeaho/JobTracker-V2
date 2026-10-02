using JobTracker.Api.Data;
using JobTracker.Api.DTOs;
using JobTracker.Api.Models;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/applications")]
public sealed class ApplicationsController : ControllerBase
{
    private readonly CurrentUser _currentUser;
    private string CurrentUserId => _currentUser.Id;
    private readonly AppDbContext _dbContext;

    public ApplicationsController(AppDbContext dbContext, CurrentUser currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<JobApplicationResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<JobApplicationResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var applications = await _dbContext.JobApplications
            .Include(application => application.Events)
            .AsNoTracking()
            .Where(application => application.UserId == CurrentUserId)
            .OrderByDescending(application => application.CreatedAt)
            .ThenBy(application => application.Id)
            .ToListAsync(cancellationToken);

        var response = applications
            .Select(JobApplicationResponse.FromEntity)
            .ToList();

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<JobApplicationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JobApplicationResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var application = await _dbContext.JobApplications
            .Include(application => application.Events)
            .AsNoTracking()
            .SingleOrDefaultAsync(
                application => application.Id == id && application.UserId == CurrentUserId,
                cancellationToken);

        if (application is null)
        {
            return NotFound();
        }

        var response = JobApplicationResponse.FromEntity(application);
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType<JobApplicationResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<JobApplicationResponse>> Create(
        CreateJobApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var application = new JobApplication
        {
            Id = Guid.NewGuid(),
            UserId = CurrentUserId,
            CompanyName = request.CompanyName.Trim(),
            JobTitle = request.JobTitle.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };
        ApplyRequestToApplication(application, request);

        ApplicationWorkflow.AddEvent(application, ApplicationEventType.ApplicationCreated, now, now);
        ApplicationWorkflow.SynchronizeAppliedDate(application, null, now);
        _dbContext.JobApplications.Add(application);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = JobApplicationResponse.FromEntity(application);
        return CreatedAtAction(
            nameof(GetById),
            new { id = application.Id },
            response);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<JobApplicationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JobApplicationResponse>> Update(
        Guid id,
        UpdateJobApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var application = await FindApplicationForCurrentUserAsync(id, cancellationToken);

        if (application is null)
        {
            return NotFound();
        }

        var now = DateTime.UtcNow;
        var previousStatus = application.Status;
        var previousAppliedDate = application.AppliedDate;
        ApplyRequestToApplication(application, request);
        ApplicationWorkflow.RecordStatusChange(application, previousStatus, now);
        ApplicationWorkflow.SynchronizeAppliedDate(application, previousAppliedDate, now);
        application.UpdatedAt = now;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = JobApplicationResponse.FromEntity(application);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var application = await FindApplicationForCurrentUserAsync(id, cancellationToken);

        if (application is null)
        {
            return NotFound();
        }

        _dbContext.JobApplications.Remove(application);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private Task<JobApplication?> FindApplicationForCurrentUserAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return _dbContext.JobApplications.Include(application => application.Events).SingleOrDefaultAsync(
            application => application.Id == id && application.UserId == CurrentUserId,
            cancellationToken);
    }

    private static void ApplyRequestToApplication(
        JobApplication application,
        JobApplicationRequest request)
    {
        application.CompanyName = request.CompanyName.Trim();
        application.JobTitle = request.JobTitle.Trim();
        application.JobUrl = request.JobUrl;
        application.Location = request.Location;
        application.Source = request.Source;
        application.ApplicationMethod = request.ApplicationMethod;
        application.FollowUpMode = request.FollowUpMode;
        application.ContactPerson = string.IsNullOrWhiteSpace(request.ContactPerson) ? null : request.ContactPerson.Trim();
        application.ContactEmail = string.IsNullOrWhiteSpace(request.ContactEmail) ? null : request.ContactEmail.Trim();
        application.Status = request.Status;
        application.AppliedDate = request.AppliedDate;
        application.Deadline = request.Deadline;
        application.SalaryRange = request.SalaryRange;
        application.Notes = request.Notes;
        application.JobDescription = request.JobDescription;
    }
}
