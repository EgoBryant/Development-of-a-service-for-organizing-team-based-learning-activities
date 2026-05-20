using TeamExamProject.Contracts.Events;

namespace TeamExamProject.Services;

public interface IEventsService
{
    Task<IReadOnlyCollection<CalendarEventResponse>> GetCalendarAsync(int userId, CalendarEventQuery query, CancellationToken cancellationToken = default);
    Task<CalendarEventResponse?> CreateAsync(int userId, CreateCalendarEventDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int userId, int eventId, bool isAdmin, CancellationToken cancellationToken = default);
}
