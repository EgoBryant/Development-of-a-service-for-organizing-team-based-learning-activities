using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

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
