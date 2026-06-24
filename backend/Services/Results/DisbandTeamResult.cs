namespace TeamExamProject.Services;

public enum DisbandTeamResultType
{
    Disbanded,
    UserNotFound,
    NotInTeam,
    NotCaptain
}

public sealed class DisbandTeamResult
{
    public required DisbandTeamResultType Type { get; init; }
}
