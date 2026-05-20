namespace TeamExamProject.Services;

/// <summary>
/// MVP-заглушка. Парсер оценок учебного портала УрФУ — отдельная задача DevOps/Sec.
/// </summary>
public interface IPortalGradesImporter
{
    Task<int> ImportForUserAsync(int userId, CancellationToken cancellationToken = default);
}

public sealed class NotImplementedPortalGradesImporter : IPortalGradesImporter
{
    public Task<int> ImportForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Импорт оценок учебного портала УрФУ не подключён в MVP. См. ТЗ Фаза 2.");
    }
}
