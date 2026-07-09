using JobTracker.Api.Data;
using JobTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ApplicationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobApplication>>> GetApplications()
    {
        var userId = "dev-user";

        var applications = await _db.JobApplications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedAt)
            .ToListAsync();

        return Ok(applications);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobApplication>> GetApplication(int id)
    {
        var userId = "dev-user";

        var application = await _db.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (application is null)
        {
            return NotFound();
        }

        return Ok(application);
    }

    [HttpPost]
    public async Task<ActionResult<JobApplication>> CreateApplication(JobApplication application)
    {
        application.Id = 0;
        application.UserId = "dev-user";
        application.CreatedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;

        _db.JobApplications.Add(application);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateApplication(int id, JobApplication updated)
    {
        var userId = "dev-user";

        var application = await _db.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (application is null)
        {
            return NotFound();
        }

        application.CompanyName = updated.CompanyName;
        application.JobTitle = updated.JobTitle;
        application.JobUrl = updated.JobUrl;
        application.Location = updated.Location;
        application.Source = updated.Source;
        application.Status = updated.Status;
        application.AppliedDate = updated.AppliedDate;
        application.Deadline = updated.Deadline;
        application.SalaryRange = updated.SalaryRange;
        application.Notes = updated.Notes;
        application.JobDescription = updated.JobDescription;
        application.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteApplication(int id)
    {
        var userId = "dev-user";

        var application = await _db.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (application is null)
        {
            return NotFound();
        }

        _db.JobApplications.Remove(application);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
