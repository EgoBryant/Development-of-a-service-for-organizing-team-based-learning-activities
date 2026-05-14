using TeamExamProject.Contracts.Knowledge;

namespace TeamExamProject.Services;

public interface IKnowledgePostsService
{
    Task<IReadOnlyCollection<KnowledgePostResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<KnowledgePostResponse?> CreateAsync(int userId, CreateKnowledgePostDto request, CancellationToken cancellationToken = default);
}
