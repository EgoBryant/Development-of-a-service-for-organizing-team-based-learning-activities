using TeamExamProject.Contracts.Events;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис календаря событий: командные и личные мероприятия пользователя.
/// </summary>
public interface IEventsService
{
    /// <summary>Возвращает события календаря пользователя с учётом параметров запроса.</summary>
    Task<IReadOnlyCollection<CalendarEventResponse>> GetCalendarAsync(int userId, CalendarEventQuery query, CancellationToken cancellationToken = default);

    /// <summary>Создаёт новое событие от имени пользователя.</summary>
    Task<CalendarEventResponse?> CreateAsync(int userId, CreateCalendarEventDto request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удаляет событие: автор или администратор.
    /// </summary>
    /// <returns><c>true</c>, если событие найдено и удалено.</returns>
    Task<bool> DeleteAsync(int userId, int eventId, bool isAdmin, CancellationToken cancellationToken = default);
}
