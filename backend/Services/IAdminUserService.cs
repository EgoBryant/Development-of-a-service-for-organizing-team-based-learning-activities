namespace TeamExamProject.Services;

/// <summary>
/// Доменные операции администратора над пользователями. Контроллер не обращается к БД напрямую.
/// </summary>
public interface IAdminUserService
{
    /// <summary>
    /// Обновляет количество баллов пользователя по идентификатору.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    /// <param name="userPoints">Новое значение баллов.</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    /// <returns><c>true</c>, если пользователь найден и баллы обновлены; иначе <c>false</c>.</returns>
    Task<bool> UpdatePointsAsync(int userId, int userPoints, CancellationToken cancellationToken = default);

    /// <summary>
    /// Обновляет количество баллов пользователя по адресу электронной почты.
    /// </summary>
    /// <param name="email">Email пользователя.</param>
    /// <param name="userPoints">Новое значение баллов.</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    /// <returns><c>true</c>, если пользователь найден и баллы обновлены; иначе <c>false</c>.</returns>
    Task<bool> UpdatePointsByEmailAsync(string email, int userPoints, CancellationToken cancellationToken = default);
}
