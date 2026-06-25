using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис запросов на «спасение»: команды просят помощь у других команд на бирже взаимопомощи.
/// </summary>
public interface IHelpRequestsService
{
    /// <summary>
    /// Возвращает запросы на помощь.
    /// </summary>
    /// <param name="userId">Идентификатор текущего пользователя.</param>
    /// <param name="isAdmin">Признак прав администратора (расширенная область выборки).</param>
    /// <param name="scope">Область выборки: <c>all</c>, <c>incoming</c> или <c>outgoing</c>. По умолчанию — все (только для admin) или текущая команда.</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    Task<IReadOnlyCollection<HelpRequestResponse>> GetAsync(int userId, bool isAdmin, string? scope, CancellationToken cancellationToken = default);

    /// <summary>Создаёт новый запрос на помощь от капитана команды.</summary>
    Task<HelpRequestCreateResult> CreateAsync(int userId, CreateHelpRequestDto request, CancellationToken cancellationToken = default);

    /// <summary>Обновляет статус запроса на помощь (принятие, отклонение, завершение).</summary>
    Task<HelpRequestStatusUpdateResult> UpdateStatusAsync(int userId, int helpRequestId, UpdateHelpRequestStatusDto request, CancellationToken cancellationToken = default);
}
