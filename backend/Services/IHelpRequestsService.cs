using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

public interface IHelpRequestsService
{
    /// <summary>scope = all | incoming | outgoing. По умолчанию all (только если admin) или текущая команда.</summary>
    Task<IReadOnlyCollection<HelpRequestResponse>> GetAsync(int userId, bool isAdmin, string? scope, CancellationToken cancellationToken = default);
    Task<HelpRequestCreateResult> CreateAsync(int userId, CreateHelpRequestDto request, CancellationToken cancellationToken = default);
    Task<HelpRequestStatusUpdateResult> UpdateStatusAsync(int userId, int helpRequestId, UpdateHelpRequestStatusDto request, CancellationToken cancellationToken = default);
}
