using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

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
