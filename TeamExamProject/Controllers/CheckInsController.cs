using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.CheckIns;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Эндпоинты еженедельных check-in отчетов команды.
/// </summary>
[Route("api/checkins")]
[Authorize]
public class CheckInsController : ApiControllerBase
{
    private readonly ICheckInsService _checkInsService;

    public CheckInsController(ICheckInsService checkInsService)
    {
        _checkInsService = checkInsService;
    }

    /// <summary>
    /// Возвращает список check-in текущей команды.
    /// </summary>
    /// <returns>История еженедельных отчетов команды.</returns>
    [HttpGet]
    [ProducesResponseType<IEnumerable<CheckInResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<CheckInResponse>>> GetCurrentTeamCheckIns(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _checkInsService.GetForCurrentTeamAsync(userId.Value, cancellationToken));
    }

    /// <summary>
    /// Создает новый еженедельный check-in для команды текущего капитана.
    /// </summary>
    /// <param name="request">Неделя, статус и текст отчета команды.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Созданный check-in.</returns>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Captain)]
    [ProducesResponseType<CheckInResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CheckInResponse>> Create(CreateCheckInDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _checkInsService.CreateAsync(userId.Value, request, cancellationToken);
        return result.Type switch
        {
            CheckInCreateResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            CheckInCreateResultType.UserHasNoTeam => Conflict(Problem(
                title: "Team required",
                detail: "You must belong to a team before creating a check-in.",
                statusCode: StatusCodes.Status409Conflict)),
            CheckInCreateResultType.DuplicateWeek => Conflict(Problem(
                title: "Duplicate week",
                detail: "A check-in for this week already exists for the team.",
                statusCode: StatusCodes.Status409Conflict)),
            CheckInCreateResultType.Created when result.CheckIn is not null => CreatedAtAction(
                nameof(GetCurrentTeamCheckIns),
                new { id = result.CheckIn.Id },
                result.CheckIn),
            _ => Problem(
                title: "Check-in creation failed",
                detail: "The check-in could not be created.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }
}
