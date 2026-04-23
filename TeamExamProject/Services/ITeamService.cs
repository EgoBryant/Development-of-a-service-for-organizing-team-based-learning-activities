using TeamExamProject.Contracts.Teams;

namespace TeamExamProject.Services;

public interface ITeamService
{
    Task<IReadOnlyCollection<TeamResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TeamResponse?> GetByIdAsync(int teamId, CancellationToken cancellationToken = default);
    Task<TeamResponse?> GetForUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<CreateTeamResult> CreateAsync(int userId, CreateTeamDto request, CancellationToken cancellationToken = default);
    Task<JoinTeamResult> JoinAsync(int userId, JoinTeamRequest request, CancellationToken cancellationToken = default);
    Task<TeamResponse?> UpdateScoreAsync(int teamId, UpdateTeamScoreRequest request, CancellationToken cancellationToken = default);
}

public enum CreateTeamResultType
{
    Created,
    UserNotFound,
    AlreadyInTeam
}

public sealed class CreateTeamResult
{
    public required CreateTeamResultType Type { get; init; }
    public TeamResponse? Team { get; init; }
}

public enum JoinTeamResultType
{
    Joined,
    UserNotFound,
    AlreadyInTeam,
    TeamNotFound
}

public sealed class JoinTeamResult
{
    public required JoinTeamResultType Type { get; init; }
    public TeamResponse? Team { get; init; }
}
