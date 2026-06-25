using TeamExamProject.Contracts.Auth;

namespace TeamExamProject.Services;

/// <summary>
/// Use-case-сервис аутентификации. Контроллер только маршрутизирует HTTP, всю работу выполняет сервис.
/// </summary>
public interface IAuthService
{
    /// <summary>Регистрирует нового пользователя и возвращает результат с токеном при успехе.</summary>
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

    /// <summary>Выполняет вход по учётным данным и возвращает JWT при успешной проверке.</summary>
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
