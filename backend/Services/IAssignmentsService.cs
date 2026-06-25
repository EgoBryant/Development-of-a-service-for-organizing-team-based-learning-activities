using TeamExamProject.Contracts.Assignments;

namespace TeamExamProject.Services;

public interface IAssignmentsService
{
    Task<IReadOnlyCollection<AssignmentResponse>> GetFeedAsync(string? leagueTier, CancellationToken cancellationToken = default);
    Task<AssignmentResponse?> CreateAsync(CreateAssignmentDto request, CancellationToken cancellationToken = default);
    Task<AssignmentResponse?> ReserveForFeedAsync(int assignmentId, CancellationToken cancellationToken = default);
    Task<bool> ReleaseFromFeedAsync(int assignmentId, CancellationToken cancellationToken = default);
}
