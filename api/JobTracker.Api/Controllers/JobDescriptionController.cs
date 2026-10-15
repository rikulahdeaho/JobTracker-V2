using JobTracker.Api.DTOs;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/job-description")]
public sealed class JobDescriptionController(JobDescriptionParser parser) : ControllerBase
{
    [HttpPost("parse")]
    [ProducesResponseType<ParseJobDescriptionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<ParseJobDescriptionResponse> Parse(ParseJobDescriptionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { error = "Enter a job description to analyze." });

        return Ok(parser.Parse(request.Text, request.ReferenceDate));
    }
}
