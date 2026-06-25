using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Votes;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Анонимное голосование внутри команды: оценка вклада участников по 5-балльной шкале.
/// Базовый маршрут: <c>api/votes</c>. Требуется JWT; создание и изменение — политика Student.
/// </summary>
[Route("api/votes")]
[Authorize]
public class VotesController : ApiControllerBase
{
    private readonly IVotesService _votesService;

    public VotesController(IVotesService votesService)
    {
        _votesService = votesService;
    }

    /// <summary>
    /// GET <c>api/votes</c> — возвращает все голоса текущей команды пользователя.
    /// Требуется JWT. 200 со списком голосов; 401 без токена.
    /// </summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<VoteResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<VoteResponse>>> GetCurrentTeamVotes(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _votesService.GetForCurrentTeamAsync(userId.Value, cancellationToken));
    }

    /// <summary>
    /// GET <c>api/votes/my</c> — возвращает голоса, отданные текущим пользователем (кого уже оценил).
    /// Требуется JWT. 200 со списком; 401 без токена.
    /// </summary>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    [HttpGet("my")]
    [ProducesResponseType<IEnumerable<MyVoteResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<MyVoteResponse>>> GetMyVotes(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }
        return Ok(await _votesService.GetMyVotesAsync(userId.Value, cancellationToken));
    }

    /// <summary>
    /// POST <c>api/votes</c> — создаёт голос за участника своей команды.
    /// Требуется JWT и политика Student. 201 Created; 400 — голос за себя или участника другой команды;
    /// 404 — пользователь или участник не найден; 409 — нет команды или голос уже отдан.
    /// </summary>
    /// <param name="request">Идентификатор участника и оценка по 5-балльной шкале.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<VoteResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<VoteResponse>> Create(CreateVoteDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _votesService.CreateAsync(userId.Value, request, cancellationToken);
        return result.Type switch
        {
            VoteCreateResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            VoteCreateResultType.UserHasNoTeam => Conflict(Problem(
                title: "Team required",
                detail: "You must belong to a team before voting.",
                statusCode: StatusCodes.Status409Conflict)),
            VoteCreateResultType.TargetUserNotFound => NotFound(Problem(
                title: "Target user not found",
                detail: "The selected teammate was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            VoteCreateResultType.DifferentTeams => BadRequest(Problem(
                title: "Invalid vote target",
                detail: "You can vote only for members of your own team.",
                statusCode: StatusCodes.Status400BadRequest)),
            VoteCreateResultType.SelfVote => BadRequest(Problem(
                title: "Self vote is forbidden",
                detail: "You cannot vote for yourself.",
                statusCode: StatusCodes.Status400BadRequest)),
            VoteCreateResultType.DuplicateVote => Conflict(Problem(
                title: "Duplicate vote",
                detail: "You have already voted for this teammate.",
                statusCode: StatusCodes.Status409Conflict)),
            VoteCreateResultType.Created when result.Vote is not null => CreatedAtAction(
                nameof(GetCurrentTeamVotes),
                new { id = result.Vote.Id },
                result.Vote),
            _ => Problem(
                title: "Vote creation failed",
                detail: "The vote could not be created.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// PUT <c>api/votes</c> — изменяет ранее отданный голос за участника своей команды.
    /// Требуется JWT и политика Student. 200 с обновлённым голосом; 400 — недопустимая цель;
    /// 404 — пользователь, участник или голос не найден; 409 — нет команды.
    /// </summary>
    /// <param name="request">Идентификатор участника и новая оценка по 5-балльной шкале.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    [HttpPut]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<VoteResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<VoteResponse>> Update(CreateVoteDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _votesService.UpdateAsync(userId.Value, request, cancellationToken);
        return result.Type switch
        {
            VoteUpdateResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            VoteUpdateResultType.UserHasNoTeam => Conflict(Problem(
                title: "Team required",
                detail: "You must belong to a team before voting.",
                statusCode: StatusCodes.Status409Conflict)),
            VoteUpdateResultType.TargetUserNotFound => NotFound(Problem(
                title: "Target user not found",
                detail: "The selected teammate was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            VoteUpdateResultType.DifferentTeams => BadRequest(Problem(
                title: "Invalid vote target",
                detail: "You can vote only for members of your own team.",
                statusCode: StatusCodes.Status400BadRequest)),
            VoteUpdateResultType.VoteNotFound => NotFound(Problem(
                title: "Vote not found",
                detail: "You have not voted for this teammate yet.",
                statusCode: StatusCodes.Status404NotFound)),
            VoteUpdateResultType.Updated when result.Vote is not null => Ok(result.Vote),
            _ => Problem(
                title: "Vote update failed",
                detail: "The vote could not be updated.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }
}
