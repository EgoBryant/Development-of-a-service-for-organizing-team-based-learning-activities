using TeamExamProject.Contracts.News;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис новостей платформы: публикация и удаление объявлений для пользователей.
/// </summary>
public interface INewsService
{
    /// <summary>Возвращает список новостей с опциональным ограничением количества.</summary>
    Task<IReadOnlyCollection<NewsResponse>> GetAllAsync(int? limit, CancellationToken cancellationToken = default);

    /// <summary>Создаёт новую новость.</summary>
    Task<NewsResponse> CreateAsync(CreateNewsDto request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удаляет новость по идентификатору.
    /// </summary>
    /// <returns><c>true</c>, если новость найдена и удалена.</returns>
    Task<bool> DeleteAsync(int newsId, CancellationToken cancellationToken = default);
}
