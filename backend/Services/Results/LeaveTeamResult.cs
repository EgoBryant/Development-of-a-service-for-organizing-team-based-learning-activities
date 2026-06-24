namespace TeamExamProject.Services;

public enum LeaveTeamResultType
{
    Left,
    UserNotFound,
    NotInTeam,
    IsCaptain
}

public sealed class LeaveTeamResult
{
    public required LeaveTeamResultType Type { get; init; }
}
