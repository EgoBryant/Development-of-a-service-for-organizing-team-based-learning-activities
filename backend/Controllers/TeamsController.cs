using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.ActivityFeed;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Управление командами: просмотр, создание, вступление, заявки и операции участника/капитана.
/// Базовый маршрут: <c>api/teams</c>. Большинство методов требуют JWT; создание/вступление — политика Student; обновление score — Admin.
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
    /// GET <c>api/teams</c> — возвращает список всех команд.
    /// Требуется JWT. 200 со списком команд (капитан, участники, invite code).
    /// </summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<TeamResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TeamResponse>>> GetAll()
    {
        return Ok(await _teamService.GetAllAsync(HttpContext.RequestAborted));
    }

    /// <summary>
    /// GET <c>api/teams/search</c> — поиск команд по названию или описанию.
    /// Требуется JWT. Параметры: <c>query</c>, <c>limit</c> (по умолчанию 20). 200 с подходящими командами.
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType<IEnumerable<TeamResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TeamResponse>>> Search([FromQuery] string? query, [FromQuery] int limit = 20)
    {
        return Ok(await _teamService.SearchAsync(query, limit, HttpContext.RequestAborted));
    }

    /// <summary>
    /// GET <c>api/teams/invite/{inviteCode}</c> — возвращает команду по пригласительному коду.
    /// Требуется JWT. 200 с данными команды; 404, если код не найден.
    /// </summary>
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
    /// GET <c>api/teams/{id}</c> — возвращает команду по идентификатору.
    /// Требуется JWT. 200 с данными команды; 404, если команда не найдена.
    /// </summary>
    /// <param name="id">Идентификатор команды.</param>
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
    /// POST <c>api/teams/create</c> — создаёт команду для пользователя, не состоящего в команде.
    /// Требуется JWT и политика Student. Создатель становится капитаном. 201 Created; 404 — пользователь не найден;
    /// 409 — пользователь уже в команде.
    /// </summary>
    /// <param name="request">Название и описание создаваемой команды.</param>
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
    /// POST <c>api/teams</c> — устаревший маршрут создания команды, эквивалентен <c>POST /api/teams/create</c>.
    /// Требуется JWT и политика Student. 201 Created или коды ошибок как у <see cref="Create"/>.
    /// </summary>
    /// <param name="request">Название и описание создаваемой команды.</param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Student)]
    [ApiExplorerSettings(IgnoreApi = false)]
    public Task<ActionResult<TeamResponse>> CreateLegacy(CreateTeamDto request)
    {
        return Create(request);
    }

    /// <summary>
    /// POST <c>api/teams/join</c> — вступает в команду по пригласительному коду.
    /// Требуется JWT и политика Student. 200 с данными команды; 404 — пользователь или команда не найдены;
    /// 409 — уже в команде или команда заполнена (макс. 6 участников).
    /// </summary>
    /// <param name="request">Invite code команды.</param>
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

    /// <summary>
    /// GET <c>api/teams/me/activity</c> — лента активности команды текущего пользователя.
    /// Требуется JWT. Параметр <c>limit</c> (по умолчанию 30). 200 со списком событий; 401 без токена.
    /// </summary>
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

    /// <summary>
    /// GET <c>api/teams/me/weekly-stats</c> — недельная статистика команды текущего пользователя.
    /// Требуется JWT. 200 со статистикой; 401 без токена; 404, если пользователь не состоит в команде.
    /// </summary>
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

    /// <summary>
    /// GET <c>api/teams/join-requests</c> — заявки на вступление в команду.
    /// Требуется JWT. Параметр <c>scope</c> фильтрует входящие/исходящие заявки. 200 со списком заявок.
    /// </summary>
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

    /// <summary>
    /// POST <c>api/teams/join-requests</c> — создаёт заявку на вступление в команду.
    /// Требуется JWT и политика Student. 201 Created; 404 — пользователь или команда не найдены;
    /// 409 — уже в команде, заявка уже существует или команда заполнена.
    /// </summary>
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

    /// <summary>
    /// PATCH <c>api/teams/join-requests/{id}/status</c> — принимает, отклоняет или отменяет заявку на вступление.
    /// Требуется JWT (капитан команды или заявитель). 200 с обновлённой заявкой; 400 — недопустимый статус;
    /// 403 — нет прав; 404 — заявка не найдена; 409 — заявитель уже в команде или команда заполнена.
    /// </summary>
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
    /// PATCH <c>api/teams/me</c> — обновляет название команды текущего капитана.
    /// Требуется JWT и политика Student. 200 с обновлённой командой; 403 — не капитан; 404 — нет команды.
    /// </summary>
    [HttpPatch("me")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<TeamResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamResponse>> UpdateMyTeam(UpdateTeamDto request)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _teamService.UpdateMyTeamAsync(userId.Value, request, HttpContext.RequestAborted);
        return result.Type switch
        {
            UpdateTeamResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            UpdateTeamResultType.NotInTeam => NotFound(Problem(
                title: "Team not found",
                detail: "The current user is not in a team.",
                statusCode: StatusCodes.Status404NotFound)),
            UpdateTeamResultType.NotCaptain => Forbid(),
            UpdateTeamResultType.InvalidName => BadRequest(Problem(
                title: "Invalid team name",
                detail: "Team name must not be empty.",
                statusCode: StatusCodes.Status400BadRequest)),
            UpdateTeamResultType.Updated when result.Team is not null => Ok(result.Team),
            _ => Problem(
                title: "Team update failed",
                detail: "The team could not be updated.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// POST <c>api/teams/me/leave</c> — покидает команду (только участник, не капитан).
    /// Требуется JWT и политика Student. 204 при успехе; 400 — капитан не может покинуть команду;
    /// 404 — пользователь не в команде.
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
    /// POST <c>api/teams/me/disband</c> — расформировывает команду текущего капитана (MVP-сценарий).
    /// Требуется JWT и политика Student. Эквивалентен <see cref="DisbandMyTeam"/>. 204 при успехе; 403 — не капитан; 404 — нет команды.
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
    /// DELETE <c>api/teams/me</c> — расформировывает команду текущего капитана (MVP-сценарий).
    /// Требуется JWT и политика Student. 204 при успехе; 403 — не капитан; 404 — нет команды.
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
    /// GET <c>api/teams/me</c> — возвращает команду текущего пользователя.
    /// Требуется JWT. 200 с данными команды; 401 без токена; 404, если пользователь не состоит в команде.
    /// </summary>
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
    /// PATCH <c>api/teams/{id}/score</c> — обновляет рейтинг/баллы команды.
    /// Требуется JWT и роль Admin. 200 с обновлённой командой; 403 без прав; 404, если команда не найдена.
    /// </summary>
    /// <param name="id">Идентификатор команды.</param>
    /// <param name="request">Новые значения рейтинга/баллов команды.</param>
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
