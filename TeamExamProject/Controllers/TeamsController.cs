using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Методы управления командами: просмотр, создание, вступление и обновление рейтинга.
/// </summary>
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

    private int? GetCurrentUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(id, out var parsedId) ? parsedId : null;
    }
}
