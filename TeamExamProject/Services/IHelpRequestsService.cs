using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

public interface IHelpRequestsService
{
    Task<IReadOnlyCollection<HelpRequestResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<HelpRequestCreateResult> CreateAsync(int userId, CreateHelpRequestDto request, CancellationToken cancellationToken = default);
    Task<HelpRequestStatusUpdateResult> UpdateStatusAsync(int userId, int helpRequestId, UpdateHelpRequestStatusDto request, CancellationToken cancellationToken = default);
}

public enum HelpRequestCreateResultType
{
    Created,
    UserNotFound,
    UserHasNoTeam,
    TargetTeamNotFound,
    SameTeam
}

public sealed class HelpRequestCreateResult
{
    public required HelpRequestCreateResultType Type { get; init; }
    public HelpRequestResponse? HelpRequest { get; init; }
}

public enum HelpRequestStatusUpdateResultType
{
    Updated,
    UserNotFound,
    HelpRequestNotFound,
    Forbidden,
    InvalidStatus
}

public sealed class HelpRequestStatusUpdateResult
{
    public required HelpRequestStatusUpdateResultType Type { get; init; }
    public HelpRequestResponse? HelpRequest { get; init; }
}
