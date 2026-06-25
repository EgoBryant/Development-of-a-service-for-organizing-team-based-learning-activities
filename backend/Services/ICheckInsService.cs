using TeamExamProject.Contracts.CheckIns;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис еженедельных чек-инов команды для учёта сплочённости.
/// </summary>
public interface ICheckInsService
{
    /// <summary>Возвращает чек-ины текущей команды пользователя.</summary>
    Task<IReadOnlyCollection<CheckInResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Создаёт чек-ин от имени пользователя за текущую неделю.</summary>
    Task<CheckInCreateResult> CreateAsync(int userId, CreateCheckInDto request, CancellationToken cancellationToken = default);
}
