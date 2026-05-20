using TeamExamProject.Contracts.Knowledge;

namespace TeamExamProject.Services;

public interface IKnowledgePostsService
{
    Task<IReadOnlyCollection<KnowledgePostResponse>> GetAllAsync(KnowledgePostQuery query, CancellationToken cancellationToken = default);
    Task<KnowledgePostResponse?> CreateAsync(int userId, CreateKnowledgePostDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteOwnAsync(int userId, int postId, bool isAdmin, CancellationToken cancellationToken = default);
}
