using TeamExamProject.Contracts.Auth;

namespace TeamExamProject.Services;

/// <summary>
/// Use-case-сервис аутентификации. Контроллер только маршрутизирует HTTP, всю работу делает сервис.
/// </summary>
public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
