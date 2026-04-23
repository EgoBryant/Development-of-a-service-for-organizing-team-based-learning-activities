using TeamExamProject.Contracts.CheckIns;

namespace TeamExamProject.Services;

public interface ICheckInsService
{
    Task<IReadOnlyCollection<CheckInResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default);
    Task<CheckInCreateResult> CreateAsync(int userId, CreateCheckInDto request, CancellationToken cancellationToken = default);
}

public enum CheckInCreateResultType
{
    Created,
    UserNotFound,
    UserHasNoTeam,
    DuplicateWeek
}

public sealed class CheckInCreateResult
{
    public required CheckInCreateResultType Type { get; init; }
    public CheckInResponse? CheckIn { get; init; }
}
