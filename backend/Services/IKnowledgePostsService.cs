using TeamExamProject.Contracts.Knowledge;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис «Биржи знаний»: объявления peer-to-peer для поиска экспертов среди студентов.
/// </summary>
public interface IKnowledgePostsService
{
    /// <summary>Возвращает объявления с учётом параметров фильтрации запроса.</summary>
    Task<IReadOnlyCollection<KnowledgePostResponse>> GetAllAsync(KnowledgePostQuery query, CancellationToken cancellationToken = default);

    /// <summary>Создаёт новое объявление от имени пользователя.</summary>
    Task<KnowledgePostResponse?> CreateAsync(int userId, CreateKnowledgePostDto request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удаляет объявление: автор может удалить своё; администратор — любое.
    /// </summary>
    /// <returns><c>true</c>, если объявление найдено и удалено.</returns>
    Task<bool> DeleteOwnAsync(int userId, int postId, bool isAdmin, CancellationToken cancellationToken = default);
}
