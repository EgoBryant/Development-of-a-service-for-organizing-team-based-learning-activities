using TeamExamProject.Contracts.CheckIns;

namespace TeamExamProject.Services;

public interface ICheckInsService
{
    Task<IReadOnlyCollection<CheckInResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default);
    Task<CheckInCreateResult> CreateAsync(int userId, CreateCheckInDto request, CancellationToken cancellationToken = default);
}
