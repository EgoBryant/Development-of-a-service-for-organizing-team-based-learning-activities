using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Events;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Игровой календарь: события команды, общеигровые события.
/// </summary>
[Route("api/events")]
[Authorize]
public class EventsController : ApiControllerBase
{
    private readonly IEventsService _eventsService;

    public EventsController(IEventsService eventsService)
    {
        _eventsService = eventsService;
    }

    /// <summary>Возвращает события календаря. Параметры: <c>from</c>, <c>to</c>, <c>scope=all|mine</c>.</summary>
    [HttpGet("calendar")]
    [ProducesResponseType<IEnumerable<CalendarEventResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CalendarEventResponse>>> GetCalendar(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? scope,
        CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }
        var query = new CalendarEventQuery { From = from, To = to, Scope = scope };
        return Ok(await _eventsService.GetCalendarAsync(userId.Value, query, cancellationToken));
    }

    /// <summary>Создает событие. <c>isGlobal=true</c> — для всех, иначе — для команды текущего пользователя.</summary>
    [HttpPost]
    [ProducesResponseType<CalendarEventResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CalendarEventResponse>> Create(CreateCalendarEventDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }
        var created = await _eventsService.CreateAsync(userId.Value, request, cancellationToken);
        if (created is null)
        {
            return NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }
        return CreatedAtAction(nameof(GetCalendar), new { id = created.Id }, created);
    }

    /// <summary>Удаляет событие (автор или администратор).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }
        var isAdmin = User.IsInRole(Roles.Admin);
        var deleted = await _eventsService.DeleteAsync(userId.Value, id, isAdmin, cancellationToken);
        if (!deleted)
        {
            return NotFound(Problem(
                title: "Event not found",
                detail: $"Event {id} was not found or you have no rights to delete it.",
                statusCode: StatusCodes.Status404NotFound));
        }
        return NoContent();
    }
}
