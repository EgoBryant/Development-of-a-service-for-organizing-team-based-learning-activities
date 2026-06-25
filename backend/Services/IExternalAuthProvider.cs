namespace TeamExamProject.Services;

/// <summary>
/// MVP-заглушка. Реальный OAuth/AD УрФУ — на DevOps (Валерий Салимгареев) после MVP.
/// </summary>
public interface IExternalAuthProvider
{
    /// <summary>
    /// Обменивает authorization code OAuth на профиль пользователя внешней системы.
    /// </summary>
    /// <param name="code">Код авторизации от провайдера OAuth.</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    /// <returns>Профиль внешнего пользователя или <c>null</c>, если обмен не удался.</returns>
    Task<ExternalAuthProfile?> ExchangeAuthorizationCodeAsync(string code, CancellationToken cancellationToken = default);
}

/// <summary>
/// Профиль пользователя, полученный от внешнего провайдера аутентификации (OAuth/AD).
/// </summary>
/// <param name="Email">Адрес электронной почты.</param>
/// <param name="FullName">Полное имя пользователя.</param>
/// <param name="ExternalId">Идентификатор во внешней системе.</param>
public sealed record ExternalAuthProfile(string Email, string FullName, string ExternalId);

/// <summary>
/// Заглушка внешней аутентификации: выбрасывает <see cref="NotImplementedException"/> до интеграции с AD УрФУ.
/// </summary>
public sealed class NotImplementedExternalAuthProvider : IExternalAuthProvider
{
    /// <inheritdoc />
    public Task<ExternalAuthProfile?> ExchangeAuthorizationCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("OAuth УрФУ не подключён в MVP. Включить в /backend/Options и реализовать после интеграции с AD.");
    }
}
