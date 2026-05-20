using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Challenges;
using TeamExamProject.Data;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Челленджи (10% от КРК). 5–10 заданий, статусы, сдача и проверка.
/// </summary>
[Route("api/challenges")]
[Authorize]
public class ChallengesController : ApiControllerBase
{
    private readonly IChallengesService _challengesService;
    private readonly AppDbContext _dbContext;

    public ChallengesController(IChallengesService challengesService, AppDbContext dbContext)
    {
        _challengesService = challengesService;
        _dbContext = dbContext;
    }

    /// <summary>Возвращает активные челленджи. Если у пользователя есть команда, отдаёт статус её попытки.</summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<ChallengeResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ChallengeResponse>>> Get(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        int? teamId = null;
        if (userId is not null)
        {
            teamId = await _dbContext.Users.AsNoTracking()
                .Where(user => user.Id == userId)
                .Select(user => user.TeamId)
                .SingleOrDefaultAsync(cancellationToken);
        }
        return Ok(await _challengesService.GetActiveAsync(teamId, cancellationToken));
    }

    /// <summary>Создает челлендж. Доступно администратору.</summary>
    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType<ChallengeResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<ChallengeResponse>> Create(CreateChallengeDto request, CancellationToken cancellationToken)
    {
        var created = await _challengesService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    /// <summary>Сдает выполненный челлендж. Доступно капитану/участнику команды.</summary>
    [HttpPost("{id:int}/submit")]
    [Authorize(Policy = PolicyNames.Student)]
    [ProducesResponseType<ChallengeProgressResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ChallengeProgressResponse>> Submit(int id, SubmitChallengeDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }
        var result = await _challengesService.SubmitAsync(userId.Value, id, request, cancellationToken);
        return result.Type switch
        {
            ChallengeProgressSubmitResultType.UserNotFound => NotFound(Problem(
                title: "User not found", detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            ChallengeProgressSubmitResultType.UserHasNoTeam => Conflict(Problem(
                title: "Team required", detail: "You must belong to a team before submitting a challenge.",
                statusCode: StatusCodes.Status409Conflict)),
            ChallengeProgressSubmitResultType.ChallengeNotFound => NotFound(Problem(
                title: "Challenge not found", detail: $"Challenge {id} was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            ChallengeProgressSubmitResultType.ChallengeInactive => BadRequest(Problem(
                title: "Challenge inactive", detail: "This challenge is no longer active.",
                statusCode: StatusCodes.Status400BadRequest)),
            ChallengeProgressSubmitResultType.AlreadySubmitted => Conflict(Problem(
                title: "Already submitted", detail: "The team already submitted this challenge.",
                statusCode: StatusCodes.Status409Conflict)),
            ChallengeProgressSubmitResultType.Submitted when result.Progress is not null => CreatedAtAction(
                nameof(Get), new { id = result.Progress.Id }, result.Progress),
            _ => Problem(title: "Submit failed", statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>Проверяет сдачу челленджа: Approved (засчитать + бонус Score) / Rejected. Только админ.</summary>
    [HttpPatch("progress/{progressId:int}/review")]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType<ChallengeProgressResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChallengeProgressResponse>> Review(int progressId, ReviewChallengeProgressDto request, CancellationToken cancellationToken)
    {
        var result = await _challengesService.ReviewAsync(progressId, request, cancellationToken);
        return result.Type switch
        {
            ChallengeProgressReviewResultType.NotFound => NotFound(Problem(
                title: "Progress not found", detail: $"Challenge progress {progressId} was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            ChallengeProgressReviewResultType.InvalidStatus => BadRequest(Problem(
                title: "Invalid status", detail: "Allowed statuses: Approved, Rejected.",
                statusCode: StatusCodes.Status400BadRequest)),
            ChallengeProgressReviewResultType.Updated when result.Progress is not null => Ok(result.Progress),
            _ => Problem(title: "Review failed", statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>Возвращает прогресс команды по челленджам.</summary>
    [HttpGet("teams/{teamId:int}/progress")]
    [ProducesResponseType<IEnumerable<ChallengeProgressResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ChallengeProgressResponse>>> GetTeamProgress(int teamId, CancellationToken cancellationToken)
    {
        return Ok(await _challengesService.GetTeamProgressAsync(teamId, cancellationToken));
    }
}
