namespace TeamExamProject.Services;

/// <summary>
/// MVP-заглушка. Парсер оценок учебного портала УрФУ — отдельная задача DevOps/Sec.
/// </summary>
public interface IPortalGradesImporter
{
    /// <summary>
    /// Импортирует оценки пользователя с учебного портала УрФУ и возвращает число обновлённых записей.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя платформы.</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    Task<int> ImportForUserAsync(int userId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Заглушка импортёра оценок: выбрасывает <see cref="NotImplementedException"/> до подключения парсера портала.
/// </summary>
public sealed class NotImplementedPortalGradesImporter : IPortalGradesImporter
{
    /// <inheritdoc />
    public Task<int> ImportForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Импорт оценок учебного портала УрФУ не подключён в MVP. См. ТЗ Фаза 2.");
    }
}
