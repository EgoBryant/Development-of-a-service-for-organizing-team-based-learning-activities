using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Методы регистрации, входа и получения данных текущего пользователя.
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

    /// <summary>Регистрирует нового пользователя по email и паролю.</summary>
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return MapAuthResult(result);
    }

    /// <summary>Выполняет вход пользователя по email и паролю.</summary>
    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return MapAuthResult(result);
    }

    /// <summary>Возвращает профиль текущего авторизованного пользователя.</summary>
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
        AuthResultType.EmailAlreadyTaken => Conflict(new { message = "User with this email already exists." }),
        AuthResultType.InvalidCredentials => Unauthorized(new { message = "Invalid email or password." }),
        AuthResultType.DuplicateEmail => Problem(
            title: "Database integrity error",
            detail: "More than one account uses this email. Check PostgreSQL data and unique index on Users.Email.",
            statusCode: StatusCodes.Status500InternalServerError),
        _ => Problem(title: "Authentication failed", statusCode: StatusCodes.Status500InternalServerError)
    };
}
