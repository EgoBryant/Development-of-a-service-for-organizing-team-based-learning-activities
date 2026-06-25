using TeamExamProject.Contracts.Teams;
using TeamExamProject.Contracts.ActivityFeed;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис управления командами: создание, вступление, заявки, статистика и жизненный цикл команды.
/// </summary>
public interface ITeamService
{
    /// <summary>Возвращает все команды системы.</summary>
    Task<IReadOnlyCollection<TeamResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Ищет команды по текстовому запросу с ограничением числа результатов.</summary>
    Task<IReadOnlyCollection<TeamResponse>> SearchAsync(string? query, int limit, CancellationToken cancellationToken = default);

    /// <summary>Возвращает команду по идентификатору или <c>null</c>, если не найдена.</summary>
    Task<TeamResponse?> GetByIdAsync(int teamId, CancellationToken cancellationToken = default);

    /// <summary>Возвращает команду по инвайт-коду или <c>null</c>, если код недействителен.</summary>
    Task<TeamResponse?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default);

    /// <summary>Возвращает команду, в которой состоит указанный пользователь.</summary>
    Task<TeamResponse?> GetForUserAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Возвращает ленту активности команды пользователя.</summary>
    Task<IReadOnlyCollection<ActivityFeedItemResponse>> GetActivityForUserTeamAsync(int userId, int limit, CancellationToken cancellationToken = default);

    /// <summary>Возвращает недельную статистику команды пользователя.</summary>
    Task<TeamWeeklyStatsResponse?> GetWeeklyStatsForUserTeamAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Возвращает идентификатор команды пользователя или <c>null</c>, если пользователь не в команде.</summary>
    Task<int?> GetTeamIdForUserAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Создаёт новую команду от имени пользователя.</summary>
    Task<CreateTeamResult> CreateAsync(int userId, CreateTeamDto request, CancellationToken cancellationToken = default);

    /// <summary>Вступает в команду по инвайт-коду или идентификатору.</summary>
    Task<JoinTeamResult> JoinAsync(int userId, JoinTeamRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Возвращает заявки на вступление в команду.
    /// </summary>
    /// <param name="userId">Идентификатор текущего пользователя.</param>
    /// <param name="scope">Область выборки (например, входящие или исходящие заявки).</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    Task<IReadOnlyCollection<TeamJoinRequestResponse>> GetJoinRequestsAsync(int userId, string? scope, CancellationToken cancellationToken = default);

    /// <summary>Создаёт заявку на вступление в команду.</summary>
    Task<TeamJoinRequestResult> CreateJoinRequestAsync(int userId, CreateTeamJoinRequestDto request, CancellationToken cancellationToken = default);

    /// <summary>Обновляет статус заявки на вступление (одобрение или отклонение).</summary>
    Task<TeamJoinRequestResult> UpdateJoinRequestStatusAsync(int userId, int requestId, UpdateTeamJoinRequestStatusDto request, CancellationToken cancellationToken = default);

    /// <summary>Обновляет командный счёт (рейтинг) команды.</summary>
    Task<TeamResponse?> UpdateScoreAsync(int teamId, UpdateTeamScoreRequest request, CancellationToken cancellationToken = default);

    /// <summary>Обновляет название команды (только капитан).</summary>
    Task<UpdateTeamResult> UpdateMyTeamAsync(int userId, UpdateTeamDto request, CancellationToken cancellationToken = default);

    /// <summary>Расформировывает команду (только капитан).</summary>
    Task<DisbandTeamResult> DisbandAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Выходит из команды (не капитан).</summary>
    Task<LeaveTeamResult> LeaveAsync(int userId, CancellationToken cancellationToken = default);
}
