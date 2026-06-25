using TeamExamProject.Contracts.ActivityFeed;

namespace TeamExamProject.Services;

/// <summary>
/// Сервис ленты активности: чтение последних событий и добавление записей о действиях команд и пользователей.
/// </summary>
public interface IActivityFeedService
{
    /// <summary>
    /// Возвращает последние записи ленты активности в порядке убывания времени.
    /// </summary>
    /// <param name="limit">Максимальное число записей (по умолчанию 50).</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    Task<IReadOnlyCollection<ActivityFeedItemResponse>> GetRecentAsync(int limit = 50, CancellationToken cancellationToken = default);

    /// <summary>
    /// Добавляет новую запись в ленту активности.
    /// </summary>
    /// <param name="type">Тип события (код категории).</param>
    /// <param name="message">Текст сообщения для отображения.</param>
    /// <param name="teamId">Идентификатор связанной команды, если применимо.</param>
    /// <param name="userId">Идентификатор связанного пользователя, если применимо.</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    Task AppendAsync(string type, string message, int? teamId = null, int? userId = null, CancellationToken cancellationToken = default);
}
