using TeamExamProject.Contracts.CheckIns;

namespace TeamExamProject.Services;

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
