using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Votes;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Эндпоинты анонимного голосования внутри команды.
/// </summary>
[ApiController]
[Route("api/votes")]
[Authorize]
public class VotesController : ControllerBase
{
    private readonly IVotesService _votesService;

    public VotesController(IVotesService votesService)
    {
        _votesService = votesService;
    }

    /// <summary>
    /// Возвращает все голоса текущей команды.
    /// </summary>
    /// <returns>Список голосов участников команды.</returns>
    [HttpGet]
    [ProducesResponseType<IEnumerable<VoteResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<VoteResponse>>> GetCurrentTeamVotes(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _votesService.GetForCurrentTeamAsync(userId.Value, cancellationToken));
    }

    /// <summary>
    /// Создает голос за участника своей команды.
    /// </summary>
    /// <param name="request">Идентификатор участника и оценка по 5-балльной шкале.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Созданный голос.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<VoteResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<VoteResponse>> Create(CreateVoteDto request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
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
}
