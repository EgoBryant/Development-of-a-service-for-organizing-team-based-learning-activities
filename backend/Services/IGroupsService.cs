using TeamExamProject.Contracts.Groups;

namespace TeamExamProject.Services;

public interface IGroupsService
{
    Task<IReadOnlyCollection<GroupResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<GroupResponse> CreateAsync(CreateGroupDto request, CancellationToken cancellationToken = default);
}
