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

    public AuthController(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        IJwtTokenService jwtTokenService,
        IProfileService profileService,
        IOptions<JwtOptions> jwtOptions)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _profileService = profileService;
        _jwtOptions = jwtOptions.Value;
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
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Email == email);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
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

        var user = await _dbContext.Users.AsNoTracking().SingleOrDefaultAsync(existingUser => existingUser.Id == userId.Value);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(await BuildUserProfileResponseAsync(user));
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(User user)
    {
        var profile = await BuildUserProfileResponseAsync(user);
        var token = _jwtTokenService.CreateToken(user);

        return new AuthResponse
        {
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
            IsCaptain = profile.IsCaptain
        };
    }

    private async Task<UserProfileResponse> BuildUserProfileResponseAsync(User user)
    {
        return await _profileService.GetProfileAsync(user.Id)
               ?? throw new InvalidOperationException($"User profile {user.Id} was not found.");
    }
}
