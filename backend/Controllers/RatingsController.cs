using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Ratings;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Лидерборды команд и пользователей (рейтинги КРК и баллов).
/// Базовый маршрут: <c>api/ratings</c>. Все методы требуют JWT.
/// JSON совместим с <c>RatingTeam</c> / <c>RatingUser</c> на фронте (поле <c>id</c> отдаётся строкой).
/// </summary>
[Route("api/ratings")]
[Authorize]
public class RatingsController : ApiControllerBase
{
    private readonly IRatingsService _ratingsService;

    public RatingsController(IRatingsService ratingsService)
    {
        _ratingsService = ratingsService;
    }

    /// <summary>
    /// GET <c>api/ratings/teams</c> — лидерборд команд с фильтрацией и сортировкой.
    /// Требуется JWT. Параметры: <c>search</c>, <c>sort</c>, <c>limit</c>, <c>league</c>. 200 со списком команд.
    /// </summary>
    [HttpGet("teams")]
    [ProducesResponseType<IEnumerable<RatingTeamResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RatingTeamResponse>>> GetTeams(
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] int? limit,
        [FromQuery] string? league,
        CancellationToken cancellationToken)
    {
        var query = new RatingQuery { Search = search, Sort = sort, Limit = limit, League = league };
        return Ok(await _ratingsService.GetTeamsAsync(query, cancellationToken));
    }

    /// <summary>
    /// GET <c>api/ratings/teams/{id}</c> — карточка команды в рейтинге по идентификатору.
    /// Требуется JWT. 200 с данными команды; 404, если команда не найдена.
    /// </summary>
    [HttpGet("teams/{id:int}")]
    [ProducesResponseType<RatingTeamResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RatingTeamResponse>> GetTeam(int id, CancellationToken cancellationToken)
    {
        var team = await _ratingsService.GetTeamByIdAsync(id, cancellationToken);
        if (team is null)
        {
            return NotFound(Problem(title: "Team not found", detail: $"Team {id} was not found.", statusCode: StatusCodes.Status404NotFound));
        }
        return Ok(team);
    }

    /// <summary>
    /// GET <c>api/ratings/users</c> — лидерборд пользователей с фильтрацией и сортировкой.
    /// Требуется JWT. Параметры: <c>search</c>, <c>sort</c>, <c>limit</c>, <c>teamId</c>, <c>group</c>, <c>league</c>.
    /// 200 со списком пользователей.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType<IEnumerable<RatingUserResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RatingUserResponse>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] int? limit,
        [FromQuery] int? teamId,
        [FromQuery] string? group,
        [FromQuery] string? league,
        CancellationToken cancellationToken)
    {
        var query = new RatingQuery { Search = search, Sort = sort, Limit = limit, TeamId = teamId, Group = group, League = league };
        return Ok(await _ratingsService.GetUsersAsync(query, cancellationToken));
    }

    /// <summary>
    /// GET <c>api/ratings/users/{id}</c> — карточка пользователя в рейтинге по идентификатору.
    /// Требуется JWT. 200 с данными пользователя; 404, если пользователь не найден.
    /// </summary>
    [HttpGet("users/{id:int}")]
    [ProducesResponseType<RatingUserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RatingUserResponse>> GetUser(int id, CancellationToken cancellationToken)
    {
        var user = await _ratingsService.GetUserByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound(Problem(title: "User not found", detail: $"User {id} was not found.", statusCode: StatusCodes.Status404NotFound));
        }
        return Ok(user);
    }
}
