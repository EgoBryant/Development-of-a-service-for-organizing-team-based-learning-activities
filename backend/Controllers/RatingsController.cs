using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Ratings;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Лидерборды команд и пользователей. JSON совместим с <c>RatingTeam</c> / <c>RatingUser</c> на фронте
/// (поле <c>id</c> отдаётся строкой).
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
    /// Лидерборд команд. Параметры: <c>search</c>, <c>sort</c>, <c>limit</c> (топ-10 при limit=10).
    /// </summary>
    [HttpGet("teams")]
    [ProducesResponseType<IEnumerable<RatingTeamResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RatingTeamResponse>>> GetTeams(
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] int? limit,
        CancellationToken cancellationToken)
    {
        var query = new RatingQuery { Search = search, Sort = sort, Limit = limit };
        return Ok(await _ratingsService.GetTeamsAsync(query, cancellationToken));
    }

    /// <summary>Карточка команды для рейтинга по идентификатору.</summary>
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
    /// Лидерборд пользователей. Параметры: <c>search</c>, <c>sort</c>, <c>limit</c>.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType<IEnumerable<RatingUserResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RatingUserResponse>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] int? limit,
        CancellationToken cancellationToken)
    {
        var query = new RatingQuery { Search = search, Sort = sort, Limit = limit };
        return Ok(await _ratingsService.GetUsersAsync(query, cancellationToken));
    }

    /// <summary>Карточка пользователя в рейтинге по идентификатору.</summary>
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
