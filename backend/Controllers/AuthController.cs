using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Аутентификация: регистрация, вход и профиль текущего пользователя.
/// Базовый маршрут: <c>api/auth</c>. Регистрация и вход доступны без JWT; <c>GET me</c> требует авторизации.
/// </summary>
[Route("api/[controller]")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;
    private readonly IProfileService _profileService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IProfileService profileService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _profileService = profileService;
        _logger = logger;
    }

    /// <summary>
    /// POST <c>api/auth/register</c> — регистрирует нового пользователя по email и паролю.
    /// Анонимный доступ. 200 с JWT при успехе; 409, если email уже занят.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return MapAuthResult(result);
    }

    /// <summary>
    /// POST <c>api/auth/login</c> — выполняет вход по email и паролю.
    /// Анонимный доступ. 200 с JWT при успехе; 401 при неверных учётных данных.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return MapAuthResult(result);
    }

    /// <summary>
    /// GET <c>api/auth/me</c> — возвращает профиль текущего авторизованного пользователя.
    /// Требуется JWT. 200 с профилем; 401 без токена; 404, если пользователь из токена отсутствует в БД.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> Me(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await _profileService.GetProfileAsync(userId.Value, cancellationToken);
        if (profile is null)
        {
            _logger.LogWarning("GET /api/Auth/me: user id {UserId} from token not found in database.", userId);
            return NotFound();
        }

        return Ok(profile);
    }

    private ActionResult<AuthResponse> MapAuthResult(AuthResult result) => result.Type switch
    {
        AuthResultType.Succeeded when result.Response is not null => Ok(result.Response),
        AuthResultType.EmailAlreadyTaken => Conflict(new { code = "email_taken", message = "User with this email already exists." }),
        AuthResultType.UserNotFound => NotFound(new { code = "user_not_found", message = "User with this email was not found." }),
        AuthResultType.InvalidPassword => Unauthorized(new { code = "invalid_password", message = "Invalid password." }),
        AuthResultType.InvalidCredentials => Unauthorized(new { code = "invalid_credentials", message = "Invalid email or password." }),
        AuthResultType.DuplicateEmail => Problem(
            title: "Database integrity error",
            detail: "More than one account uses this email. Check PostgreSQL data and unique index on Users.Email.",
            statusCode: StatusCodes.Status500InternalServerError),
        _ => Problem(title: "Authentication failed", statusCode: StatusCodes.Status500InternalServerError)
    };
}
