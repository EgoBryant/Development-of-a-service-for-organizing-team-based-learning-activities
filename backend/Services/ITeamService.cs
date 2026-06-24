using TeamExamProject.Contracts.Teams;
using TeamExamProject.Contracts.ActivityFeed;

namespace TeamExamProject.Services;

public interface ITeamService
{
    Task<IReadOnlyCollection<TeamResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TeamResponse>> SearchAsync(string? query, int limit, CancellationToken cancellationToken = default);
    Task<TeamResponse?> GetByIdAsync(int teamId, CancellationToken cancellationToken = default);
    Task<TeamResponse?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default);
    Task<TeamResponse?> GetForUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ActivityFeedItemResponse>> GetActivityForUserTeamAsync(int userId, int limit, CancellationToken cancellationToken = default);
    Task<TeamWeeklyStatsResponse?> GetWeeklyStatsForUserTeamAsync(int userId, CancellationToken cancellationToken = default);
    Task<int?> GetTeamIdForUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<CreateTeamResult> CreateAsync(int userId, CreateTeamDto request, CancellationToken cancellationToken = default);
    Task<JoinTeamResult> JoinAsync(int userId, JoinTeamRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TeamJoinRequestResponse>> GetJoinRequestsAsync(int userId, string? scope, CancellationToken cancellationToken = default);
    Task<TeamJoinRequestResult> CreateJoinRequestAsync(int userId, CreateTeamJoinRequestDto request, CancellationToken cancellationToken = default);
    Task<TeamJoinRequestResult> UpdateJoinRequestStatusAsync(int userId, int requestId, UpdateTeamJoinRequestStatusDto request, CancellationToken cancellationToken = default);
    Task<TeamResponse?> UpdateScoreAsync(int teamId, UpdateTeamScoreRequest request, CancellationToken cancellationToken = default);
    Task<DisbandTeamResult> DisbandAsync(int userId, CancellationToken cancellationToken = default);
    Task<LeaveTeamResult> LeaveAsync(int userId, CancellationToken cancellationToken = default);
}
