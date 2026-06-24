namespace TeamExamProject.Services;

/// <summary>
/// Доменные операции администратора над пользователями. Контроллер не лезет в БД напрямую.
/// </summary>
public interface IAdminUserService
{
    Task<bool> UpdatePointsAsync(int userId, int userPoints, CancellationToken cancellationToken = default);
    Task<bool> UpdatePointsByEmailAsync(string email, int userPoints, CancellationToken cancellationToken = default);
}
