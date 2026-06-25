using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Events;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Календарь событий: глобальные и командные мероприятия.
/// </summary>
public class EventsService : IEventsService
{
    private readonly AppDbContext _dbContext;
    private readonly IActivityFeedService _activityFeed;

    /// <summary>
    /// Создаёт сервис календаря событий.
    /// </summary>
    public EventsService(AppDbContext dbContext, IActivityFeedService activityFeed)
    {
        _dbContext = dbContext;
        _activityFeed = activityFeed;
    }

    /// <summary>
    /// Возвращает события по области видимости (<c>all</c>, <c>mine</c>) и диапазону дат.
    /// </summary>
    public async Task<IReadOnlyCollection<CalendarEventResponse>> GetCalendarAsync(int userId, CalendarEventQuery query, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.AsNoTracking()
            .SingleOrDefaultAsync(existing => existing.Id == userId, cancellationToken);
        var userTeamId = user?.TeamId;

        var scope = (query.Scope ?? "all").Trim().ToLowerInvariant();

        IQueryable<CalendarEvent> baseQuery = _dbContext.CalendarEvents
            .AsNoTracking()
            .Include(calendarEvent => calendarEvent.Team)
            .Include(calendarEvent => calendarEvent.CreatedByUser);

        baseQuery = scope switch
        {
            "mine" => baseQuery.Where(calendarEvent =>
                (userTeamId != null && calendarEvent.TeamId == userTeamId) ||
                calendarEvent.CreatedByUserId == userId),
            _ => baseQuery.Where(calendarEvent =>
                calendarEvent.IsGlobal ||
                (userTeamId != null && calendarEvent.TeamId == userTeamId) ||
                calendarEvent.CreatedByUserId == userId)
        };

        if (query.From is not null)
        {
            baseQuery = baseQuery.Where(calendarEvent => calendarEvent.StartsAtUtc >= query.From);
        }
        if (query.To is not null)
        {
            baseQuery = baseQuery.Where(calendarEvent => calendarEvent.StartsAtUtc <= query.To);
        }

        var events = await baseQuery
            .OrderBy(calendarEvent => calendarEvent.StartsAtUtc)
            .ToListAsync(cancellationToken);

        return events.Select(Map).ToList();
    }

    /// <summary>
    /// Создаёт событие; глобальные не привязываются к команде, остальные — к команде автора.
    /// </summary>
    public async Task<CalendarEventResponse?> CreateAsync(int userId, CreateCalendarEventDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existing => existing.Id == userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var teamId = request.IsGlobal ? null : user.TeamId;

        var calendarEvent = new CalendarEvent
        {
            Topic = request.Topic.Trim(),
            Tag = request.Tag.Trim(),
            Description = request.Description.Trim(),
            Format = request.Format.Trim(),
            StartsAtUtc = DateTime.SpecifyKind(request.StartsAtUtc, DateTimeKind.Utc),
            IsGlobal = request.IsGlobal,
            TeamId = teamId,
            CreatedByUserId = userId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.CalendarEvents.Add(calendarEvent);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.EventCreated,
            $"{user.UserName} создал(а) событие «{calendarEvent.Topic}»",
            teamId,
            userId,
            cancellationToken);

        return await GetByIdAsync(calendarEvent.Id, cancellationToken);
    }

    /// <summary>
    /// Удаляет событие: автор или администратор.
    /// </summary>
    /// <returns><c>true</c>, если событие найдено и удалено.</returns>
    public async Task<bool> DeleteAsync(int userId, int eventId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var calendarEvent = await _dbContext.CalendarEvents.SingleOrDefaultAsync(existing => existing.Id == eventId, cancellationToken);
        if (calendarEvent is null)
        {
            return false;
        }

        if (!isAdmin && calendarEvent.CreatedByUserId != userId)
        {
            return false;
        }

        _dbContext.CalendarEvents.Remove(calendarEvent);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <summary>
    /// Загружает одно событие по идентификатору.
    /// </summary>
    private async Task<CalendarEventResponse?> GetByIdAsync(int eventId, CancellationToken cancellationToken)
    {
        var calendarEvent = await _dbContext.CalendarEvents.AsNoTracking()
            .Include(existing => existing.Team)
            .Include(existing => existing.CreatedByUser)
            .SingleOrDefaultAsync(existing => existing.Id == eventId, cancellationToken);

        return calendarEvent is null ? null : Map(calendarEvent);
    }

    /// <summary>
    /// Преобразует сущность события в DTO ответа.
    /// </summary>
    private static CalendarEventResponse Map(CalendarEvent calendarEvent) => new()
    {
        Id = calendarEvent.Id,
        Topic = calendarEvent.Topic,
        Tag = calendarEvent.Tag,
        Description = calendarEvent.Description,
        Format = calendarEvent.Format,
        StartsAtUtc = calendarEvent.StartsAtUtc,
        IsGlobal = calendarEvent.IsGlobal,
        TeamId = calendarEvent.TeamId,
        TeamName = calendarEvent.Team?.Name ?? string.Empty,
        CreatedByUserId = calendarEvent.CreatedByUserId,
        CreatedByUserName = calendarEvent.CreatedByUser?.UserName ?? string.Empty,
        CreatedAtUtc = calendarEvent.CreatedAtUtc
    };
}
