namespace TeamExamProject.Services;

/// <summary>
/// MVP-заглушка. Реальный OAuth/AD УрФУ — на DevOps (Валерий Салимгареев) после MVP.
/// </summary>
public interface IExternalAuthProvider
{
    Task<ExternalAuthProfile?> ExchangeAuthorizationCodeAsync(string code, CancellationToken cancellationToken = default);
}

public sealed record ExternalAuthProfile(string Email, string FullName, string ExternalId);

public sealed class NotImplementedExternalAuthProvider : IExternalAuthProvider
{
    public Task<ExternalAuthProfile?> ExchangeAuthorizationCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("OAuth УрФУ не подключён в MVP. Включить в /backend/Options и реализовать после интеграции с AD.");
    }
}
