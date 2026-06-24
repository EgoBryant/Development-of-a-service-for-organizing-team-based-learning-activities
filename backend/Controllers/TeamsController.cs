using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.ActivityFeed;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Методы управления командами: просмотр, создание, вступление и обновление рейтинга.
/// </summary>
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ApiControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    /// <summary>
    /// Возвращает список всех команд.
    /// </summary>
    /// <returns>Список команд с капитаном, участниками и invite code.</returns>
    [HttpGet]
    [ProducesResponseType<IEnumerable<TeamResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TeamResponse>>> GetAll()
    {
        return Ok(await _teamService.GetAllAsync(HttpContext.RequestAborted));
    }

    [HttpGet("search")]
    [ProducesResponseType<IEnumerable<TeamResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TeamResponse>>> Search([FromQuery] string? query, [FromQuery] int limit = 20)
    {
        return Ok(await _teamService.SearchAsync(query, limit, HttpContext.RequestAborted));
    }

    [HttpGet("invite/{inviteCode}")]
    [ProducesResponseType<TeamResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamResponse>> GetByInviteCode(string inviteCode)
    {
        var team = await _teamService.GetByInviteCodeAsync(inviteCode, HttpContext.RequestAborted);
        if (team is null)
        {
            return NotFound(Problem(
                title: "Team not found",
                detail: "Team with this invite code was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return Ok(team);
    }

    /// <summary>
    /// Возвращает команду по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор команды.</param>
    /// <returns>Данные выбранной команды.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType<TeamResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Создает новую команду для пользователя, который еще не состоит в команде.
    /// </summary>
    /// <param name="request">Название и описание создаваемой команды.</param>
    /// <returns>Созданная команда. Создатель автоматически становится капитаном.</returns>
    [HttpPost("create")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<TeamResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TeamResponse>> Create(CreateTeamDto request)
    {
        var userId = CurrentUserId;
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

    /// <summary>
    /// Устаревший маршрут создания команды. Полностью эквивалентен <c>POST /api/teams/create</c>.
    /// </summary>
    /// <param name="request">Название и описание создаваемой команды.</param>
    /// <returns>Созданная команда.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Student)]
    [ApiExplorerSettings(IgnoreApi = false)]
    public Task<ActionResult<TeamResponse>> CreateLegacy(CreateTeamDto request)
    {
        return Create(request);
    }

    /// <summary>
    /// Вступает в существующую команду по пригласительному коду.
    /// </summary>
    /// <param name="request">Invite code команды.</param>
    /// <returns>Команда, в которую вступил пользователь.</returns>
    [HttpPost("join")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<TeamResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TeamResponse>> Join(JoinTeamRequest request)
    {
        var userId = CurrentUserId;
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
            JoinTeamResultType.TeamFull => Conflict(Problem(
                title: "Team is full",
                detail: "A team cannot have more than 6 members.",
                statusCode: StatusCodes.Status409Conflict)),
            JoinTeamResultType.Joined when result.Team is not null => Ok(result.Team),
            _ => Problem(
                title: "Team join failed",
                detail: "The user could not join the team.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    [HttpGet("me/activity")]
    [ProducesResponseType<IEnumerable<ActivityFeedItemResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<ActivityFeedItemResponse>>> MyTeamActivity([FromQuery] int limit = 30)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _teamService.GetActivityForUserTeamAsync(userId.Value, limit, HttpContext.RequestAborted));
    }

    [HttpGet("me/weekly-stats")]
    [ProducesResponseType<TeamWeeklyStatsResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamWeeklyStatsResponse>> MyTeamWeeklyStats()
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var stats = await _teamService.GetWeeklyStatsForUserTeamAsync(userId.Value, HttpContext.RequestAborted);
        if (stats is null)
        {
            return NotFound(Problem(
                title: "Team not found",
                detail: "The current user is not assigned to a team.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return Ok(stats);
    }

    [HttpGet("join-requests")]
    [ProducesResponseType<IEnumerable<TeamJoinRequestResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<TeamJoinRequestResponse>>> GetJoinRequests([FromQuery] string? scope = null)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _teamService.GetJoinRequestsAsync(userId.Value, scope, HttpContext.RequestAborted));
    }

    [HttpPost("join-requests")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<TeamJoinRequestResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TeamJoinRequestResponse>> CreateJoinRequest(CreateTeamJoinRequestDto request)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _teamService.CreateJoinRequestAsync(userId.Value, request, HttpContext.RequestAborted);
        return result.Type switch
        {
            TeamJoinRequestResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            TeamJoinRequestResultType.TeamNotFound => NotFound(Problem(
                title: "Team not found",
                detail: $"Team {request.TeamId} was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            TeamJoinRequestResultType.AlreadyInTeam => Conflict(Problem(
                title: "Team membership conflict",
                detail: "User already belongs to a team.",
                statusCode: StatusCodes.Status409Conflict)),
            TeamJoinRequestResultType.AlreadyPending => Conflict(Problem(
                title: "Join request already exists",
                detail: "User already has a pending request for this team.",
                statusCode: StatusCodes.Status409Conflict)),
            TeamJoinRequestResultType.TeamFull => Conflict(Problem(
                title: "Team is full",
                detail: "A team cannot have more than 6 members.",
                statusCode: StatusCodes.Status409Conflict)),
            TeamJoinRequestResultType.Created when result.Request is not null => CreatedAtAction(
                nameof(GetJoinRequests),
                new { scope = "outgoing" },
                result.Request),
            _ => Problem(
                title: "Join request failed",
                detail: "The join request could not be created.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    [HttpPatch("join-requests/{id:int}/status")]
    [ProducesResponseType<TeamJoinRequestResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TeamJoinRequestResponse>> UpdateJoinRequestStatus(int id, UpdateTeamJoinRequestStatusDto request)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _teamService.UpdateJoinRequestStatusAsync(userId.Value, id, request, HttpContext.RequestAborted);
        return result.Type switch
        {
            TeamJoinRequestResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            TeamJoinRequestResultType.RequestNotFound => NotFound(Problem(
                title: "Join request not found",
                detail: $"Join request {id} was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            TeamJoinRequestResultType.InvalidStatus => BadRequest(Problem(
                title: "Invalid join request status",
                detail: "Only Pending requests can be changed to Accepted, Rejected or Cancelled.",
                statusCode: StatusCodes.Status400BadRequest)),
            TeamJoinRequestResultType.Forbidden => Forbid(),
            TeamJoinRequestResultType.ApplicantAlreadyInTeam => Conflict(Problem(
                title: "Team membership conflict",
                detail: "The applicant already belongs to a team.",
                statusCode: StatusCodes.Status409Conflict)),
            TeamJoinRequestResultType.TeamFull => Conflict(Problem(
                title: "Team is full",
                detail: "A team cannot have more than 6 members.",
                statusCode: StatusCodes.Status409Conflict)),
            TeamJoinRequestResultType.Updated when result.Request is not null => Ok(result.Request),
            _ => Problem(
                title: "Join request update failed",
                detail: "The join request could not be updated.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// Покидает команду текущего участника (не капитана).
    /// </summary>
    [HttpPost("me/leave")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LeaveMyTeam()
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _teamService.LeaveAsync(userId.Value, HttpContext.RequestAborted);
        return result.Type switch
        {
            LeaveTeamResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            LeaveTeamResultType.NotInTeam => NotFound(Problem(
                title: "Team not found",
                detail: "The current user is not in a team.",
                statusCode: StatusCodes.Status404NotFound)),
            LeaveTeamResultType.IsCaptain => BadRequest(Problem(
                title: "Captain cannot leave",
                detail: "The team captain cannot leave the team. Disband the team or transfer captaincy.",
                statusCode: StatusCodes.Status400BadRequest)),
            LeaveTeamResultType.Left => NoContent(),
            _ => Problem(
                title: "Leave team failed",
                detail: "Unable to leave the team.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// Расформировывает команду текущего капитана (временный сценарий для MVP).
    /// </summary>
    [HttpPost("me/disband")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public Task<IActionResult> DisbandMyTeamPost()
    {
        return DisbandMyTeam();
    }

    /// <summary>
    /// Расформировывает команду текущего капитана (временный сценарий для MVP).
    /// </summary>
    [HttpDelete("me")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DisbandMyTeam()
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _teamService.DisbandAsync(userId.Value, HttpContext.RequestAborted);
        return result.Type switch
        {
            DisbandTeamResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            DisbandTeamResultType.NotInTeam => NotFound(Problem(
                title: "Team not found",
                detail: "The current user is not in a team.",
                statusCode: StatusCodes.Status404NotFound)),
            DisbandTeamResultType.NotCaptain => Forbid(),
            DisbandTeamResultType.Disbanded => NoContent(),
            _ => Problem(
                title: "Team disband failed",
                detail: "The team could not be disbanded.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// Возвращает команду текущего пользователя.
    /// </summary>
    /// <returns>Текущая команда пользователя.</returns>
    [HttpGet("me")]
    [ProducesResponseType<TeamResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamResponse>> Me()
    {
        var userId = CurrentUserId;
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

    /// <summary>
    /// Обновляет рейтинг команды. Доступно только администратору.
    /// </summary>
    /// <param name="id">Идентификатор команды.</param>
    /// <param name="request">Новые значения рейтинга/баллов команды.</param>
    /// <returns>Обновленная команда.</returns>
    [HttpPatch("{id:int}/score")]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType<TeamResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
}
