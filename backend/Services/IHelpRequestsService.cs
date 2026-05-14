using TeamExamProject.Contracts.HelpRequests;

namespace TeamExamProject.Services;

public interface IHelpRequestsService
{
    Task<IReadOnlyCollection<HelpRequestResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<HelpRequestCreateResult> CreateAsync(int userId, CreateHelpRequestDto request, CancellationToken cancellationToken = default);
    Task<HelpRequestStatusUpdateResult> UpdateStatusAsync(int userId, int helpRequestId, UpdateHelpRequestStatusDto request, CancellationToken cancellationToken = default);
}
