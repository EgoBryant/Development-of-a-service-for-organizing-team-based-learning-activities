using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Options;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Методы регистрации, входа и получения данных текущего пользователя.
/// </summary>
[Route("api/[controller]")]
public class AuthController : ApiControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly JwtOptions _jwtOptions;
    private readonly IProfileService _profileService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        IJwtTokenService jwtTokenService,
        IProfileService profileService,
        IOptions<JwtOptions> jwtOptions,
        ILogger<AuthController> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _profileService = profileService;
        _jwtOptions = jwtOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Регистрирует нового пользователя по email и паролю.
    /// </summary>
    /// <param name="request">Данные для создания учетной записи.</param>
    /// <returns>JWT-токен и сведения о профиле пользователя.</returns>
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _dbContext.Users.AnyAsync(user => user.Email == email))
        {
            return Conflict(new { message = "User with this email already exists." });
        }

        var user = new User
        {
            UserName = request.UserName.Trim(),
            Email = email
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return Ok(await CreateAuthResponseAsync(user));
    }

    /// <summary>
    /// Выполняет вход пользователя по email и паролю.
    /// </summary>
    /// <param name="request">Учетные данные пользователя.</param>
    /// <returns>JWT-токен и актуальные сведения о профиле.</returns>
    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var candidates = await _dbContext.Users
            .Include(existingUser => existingUser.Group)
            .Where(existingUser => existingUser.Email == email)
            .Take(3)
            .ToListAsync();

        if (candidates.Count > 1)
        {
            _logger.LogError("Multiple users share email {Email}; expected unique index on Users.Email.", email);
            return Problem(
                title: "Database integrity error",
                detail: "More than one account uses this email. Check PostgreSQL data and unique index on Users.Email.",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        var user = candidates.Count == 0 ? null : candidates[0];

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        PasswordVerificationResult verificationResult;
        try
        {
            verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        }
        catch (FormatException exception)
        {
            _logger.LogWarning(exception, "Invalid password hash format for user id {UserId}.", user.Id);
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(await CreateAuthResponseAsync(user));
    }

    /// <summary>
    /// Возвращает профиль текущего авторизованного пользователя.
    /// </summary>
    /// <returns>Профиль текущего пользователя.</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> Me()
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await _profileService.GetProfileAsync(userId.Value);
        if (profile is null)
        {
            _logger.LogWarning("GET /api/Auth/me: user id {UserId} from token not found in database.", userId);
            return NotFound();
        }

        return Ok(profile);
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(User user)
    {
        var profile = await BuildUserProfileResponseAsync(user);
        var token = _jwtTokenService.CreateToken(user);

        return new AuthResponse
        {
            Id = profile.Id,
            Token = token,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
            UserName = profile.UserName,
            Email = profile.Email,
            Role = profile.Role,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            MiddleName = profile.MiddleName,
            Nickname = profile.Nickname,
            Bio = profile.Bio,
            AvatarUrl = profile.AvatarUrl,
            ContactEmail = profile.ContactEmail,
            TelegramHandle = profile.TelegramHandle,
            PhoneNumber = profile.PhoneNumber,
            StudentTicketNumber = profile.StudentTicketNumber,
            GroupId = profile.GroupId,
            GroupTitle = profile.GroupTitle,
            TeamId = profile.TeamId,
            TeamName = profile.TeamName,
            TeamInviteCode = profile.TeamInviteCode,
            IsCaptain = profile.IsCaptain,
            TeamScore = profile.TeamScore
        };
    }

    private Task<UserProfileResponse> BuildUserProfileResponseAsync(User user) =>
        _profileService.MapToProfileResponseAsync(user);
}
