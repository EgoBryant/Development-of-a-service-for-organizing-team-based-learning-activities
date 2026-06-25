using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.HelpRequests;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Механика взаимопомощи («Спасение») между командами: запросы помощи и смена статуса.
/// Базовый маршрут: <c>api/help-requests</c>. Требуется JWT; создание и смена статуса — политика Captain.
/// </summary>
[Route("api/help-requests")]
[Authorize]
public class HelpRequestsController : ApiControllerBase
{
    private readonly IHelpRequestsService _helpRequestsService;

    public HelpRequestsController(IHelpRequestsService helpRequestsService)
    {
        _helpRequestsService = helpRequestsService;
    }

    /// <summary>
    /// GET <c>api/help-requests</c> — возвращает запросы на помощь с фильтром <c>scope</c>.
    /// Требуется JWT. <c>scope</c>: all (admin) | incoming | outgoing; по умолчанию — входящие и исходящие для команды пользователя.
    /// 200 со списком запросов.
    /// </summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<HelpRequestResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<HelpRequestResponse>>> GetAll(
        [FromQuery] string? scope,
        CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }
        var isAdmin = User.IsInRole(Models.Roles.Admin);
        return Ok(await _helpRequestsService.GetAsync(userId.Value, isAdmin, scope, cancellationToken));
    }

    /// <summary>
    /// POST <c>api/help-requests</c> — создаёт запрос на помощь от команды текущего капитана.
    /// Требуется JWT и политика Captain. 201 Created; 400 — запрос к своей команде; 404 — пользователь или целевая команда не найдены;
    /// 409 — капитан не в команде; 403 — вызывающий не капитан.
    /// </summary>
    /// <param name="request">Описание проблемы и команда, к которой адресован запрос.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    [HttpPost]
    [Authorize(Policy = PolicyNames.Captain)]
    [ProducesResponseType<HelpRequestResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<HelpRequestResponse>> Create(CreateHelpRequestDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _helpRequestsService.CreateAsync(userId.Value, request, cancellationToken);
        return result.Type switch
        {
            HelpRequestCreateResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            HelpRequestCreateResultType.UserHasNoTeam => Conflict(Problem(
                title: "Team required",
                detail: "Captain must belong to a team to create a help request.",
                statusCode: StatusCodes.Status409Conflict)),
            HelpRequestCreateResultType.NotCaptain => Forbid(),
            HelpRequestCreateResultType.TargetTeamNotFound => NotFound(Problem(
                title: "Target team not found",
                detail: "The target team was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            HelpRequestCreateResultType.SameTeam => BadRequest(Problem(
                title: "Invalid target team",
                detail: "You cannot create a help request for your own team.",
                statusCode: StatusCodes.Status400BadRequest)),
            HelpRequestCreateResultType.Created when result.HelpRequest is not null => CreatedAtAction(
                nameof(GetAll),
                new { id = result.HelpRequest.Id },
                result.HelpRequest),
            _ => Problem(
                title: "Help request creation failed",
                detail: "The help request could not be created.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// PATCH <c>api/help-requests/{id}/status</c> — изменяет статус запроса на помощь.
    /// Требуется JWT и политика Captain (капитан целевой или исходной команды). 200 с обновлённым запросом;
    /// 400 — недопустимый статус; 403 — нет прав; 404 — запрос или пользователь не найден.
    /// </summary>
    /// <param name="id">Идентификатор запроса на помощь.</param>
    /// <param name="request">Новый статус: Open, Accepted, Rejected или Completed.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    [HttpPatch("{id:int}/status")]
    [Authorize(Policy = PolicyNames.Captain)]
    [ProducesResponseType<HelpRequestResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HelpRequestResponse>> UpdateStatus(int id, UpdateHelpRequestStatusDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await _helpRequestsService.UpdateStatusAsync(userId.Value, id, request, cancellationToken);
        return result.Type switch
        {
            HelpRequestStatusUpdateResultType.UserNotFound => NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            HelpRequestStatusUpdateResultType.HelpRequestNotFound => NotFound(Problem(
                title: "Help request not found",
                detail: $"Help request {id} was not found.",
                statusCode: StatusCodes.Status404NotFound)),
            HelpRequestStatusUpdateResultType.Forbidden => Forbid(),
            HelpRequestStatusUpdateResultType.InvalidStatus => BadRequest(Problem(
                title: "Invalid status",
                detail: "Allowed statuses: Open, Accepted, Rejected, Completed.",
                statusCode: StatusCodes.Status400BadRequest)),
            HelpRequestStatusUpdateResultType.Updated when result.HelpRequest is not null => Ok(result.HelpRequest),
            _ => Problem(
                title: "Help request update failed",
                detail: "The help request status could not be updated.",
                statusCode: StatusCodes.Status500InternalServerError)
        };
    }
}
