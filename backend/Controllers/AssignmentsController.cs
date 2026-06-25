using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Assignments;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

[Route("api/assignments")]
public class AssignmentsController : ApiControllerBase
{
    private readonly IAssignmentsService _assignmentsService;

    public AssignmentsController(IAssignmentsService assignmentsService)
    {
        _assignmentsService = assignmentsService;
    }

    [HttpGet("feed")]
    [Authorize]
    [ProducesResponseType<IEnumerable<AssignmentResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AssignmentResponse>>> GetFeed(
        [FromQuery] string? league,
        CancellationToken cancellationToken)
    {
        return Ok(await _assignmentsService.GetFeedAsync(league, cancellationToken));
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<AssignmentResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AssignmentResponse>> Create(
        CreateAssignmentDto request,
        CancellationToken cancellationToken)
    {
        if (CurrentUserId is null)
        {
            return Unauthorized();
        }

        var created = await _assignmentsService.CreateAsync(request, cancellationToken);
        if (created is null)
        {
            return BadRequest(Problem(
                title: "Invalid assignment",
                detail: "League tier must be one of: novice, pro, legend.",
                statusCode: StatusCodes.Status400BadRequest));
        }

        return Created($"/api/assignments/feed?league={created.LeagueTier}", created);
    }

    [HttpPost("{id:int}/reserve")]
    [Authorize]
    [ProducesResponseType<AssignmentResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssignmentResponse>> Reserve(int id, CancellationToken cancellationToken)
    {
        var reserved = await _assignmentsService.ReserveForFeedAsync(id, cancellationToken);
        if (reserved is null)
        {
            return NotFound(Problem(
                title: "Assignment unavailable",
                detail: $"Assignment {id} is not available in feed.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return Ok(reserved);
    }

    [HttpPost("{id:int}/release")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Release(int id, CancellationToken cancellationToken)
    {
        var released = await _assignmentsService.ReleaseFromFeedAsync(id, cancellationToken);
        if (!released)
        {
            return NotFound(Problem(
                title: "Assignment not found",
                detail: $"Assignment {id} was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return NoContent();
    }
}
