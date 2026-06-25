using TeamExamProject.Contracts.Votes;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис анонимного голосования за вклад участников команды в конце учебного цикла.
/// </summary>
public interface IVotesService
{
    /// <summary>Возвращает голоса текущей команды пользователя.</summary>
    Task<IReadOnlyCollection<VoteResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Возвращает голоса, поставленные самим пользователем.</summary>
    Task<IReadOnlyCollection<MyVoteResponse>> GetMyVotesAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Создаёт новый голос за участника команды.</summary>
    Task<VoteCreateResult> CreateAsync(int userId, CreateVoteDto request, CancellationToken cancellationToken = default);

    /// <summary>Изменяет ранее поставленный голос.</summary>
    Task<VoteUpdateResult> UpdateAsync(int userId, CreateVoteDto request, CancellationToken cancellationToken = default);
}
