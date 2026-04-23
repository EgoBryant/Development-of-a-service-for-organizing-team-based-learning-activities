using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamResponse>>> GetAll()
    {
        return Ok(await _teamService.GetAllAsync(HttpContext.RequestAborted));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TeamResponse>> GetById(int id)
    {
        var team = await _teamService.GetByIdAsync(id, HttpContext.RequestAborted);
        if (team is null)
        {
            return NotFound(Problem(
                title: "Team not found",
                detail: $"Team {id} was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return Ok(team);
    }

    [HttpPost("create")]
    [Authorize(Policy = PolicyNames.Student)]
    public async Task<ActionResult<TeamResponse>> Create(CreateTeamDto request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _teamService.CreateAsync(userId.Value, request, HttpContext.RequestAborted);
        return result.Type switch
        {
            CreateTeamResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            CreateTeamResultType.AlreadyInTeam => Conflict(Problem(
                title: "Team membership conflict",
                detail: "User already belongs to a team.",
                statusCode: StatusCodes.Status409Conflict)),
            CreateTeamResultType.Created when result.Team is not null => CreatedAtAction(
                nameof(GetById),
                new { id = result.Team.Id },
                result.Team),
            _ => Problem(
                title: "Team creation failed",
                detail: "The team could not be created.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.Student)]
    public Task<ActionResult<TeamResponse>> CreateLegacy(CreateTeamDto request)
    {
        return Create(request);
    }

    [HttpPost("join")]
    [Authorize(Policy = PolicyNames.Student)]
    public async Task<ActionResult<TeamResponse>> Join(JoinTeamRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _teamService.JoinAsync(userId.Value, request, HttpContext.RequestAborted);
        return result.Type switch
        {
            JoinTeamResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            JoinTeamResultType.AlreadyInTeam => Conflict(Problem(
                title: "Team membership conflict",
                detail: "User already belongs to a team.",
                statusCode: StatusCodes.Status409Conflict)),
            JoinTeamResultType.TeamNotFound => NotFound(Problem(
                title: "Team not found",
                detail: "Team with this invite code was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            JoinTeamResultType.Joined when result.Team is not null => Ok(result.Team),
            _ => Problem(
                title: "Team join failed",
                detail: "The user could not join the team.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    [HttpGet("me")]
    public async Task<ActionResult<TeamResponse>> Me()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var team = await _teamService.GetForUserAsync(userId.Value, HttpContext.RequestAborted);
        if (team is null)
        {
            return NotFound(Problem(
                title: "Team not found",
                detail: "The current user is not in a team.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return Ok(team);
    }

    [HttpPatch("{id:int}/score")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<TeamResponse>> UpdateScore(int id, UpdateTeamScoreRequest request)
    {
        var team = await _teamService.UpdateScoreAsync(id, request, HttpContext.RequestAborted);
        if (team is null)
        {
            return NotFound(Problem(
                title: "Team not found",
                detail: $"Team {id} was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return Ok(team);
    }

    private int? GetCurrentUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(id, out var parsedId) ? parsedId : null;
    }
}
