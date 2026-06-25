using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Options;

namespace TeamExamProject.Services;

/// <summary>
/// Регистрация, вход и формирование ответа с JWT и профилем пользователя.
/// </summary>
public class AuthService : IAuthService
{
    private const int MaxLoginCandidates = 3;

    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IProfileService _profileService;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthService> _logger;

    /// <summary>
    /// Создаёт сервис аутентификации.
    /// </summary>
    public AuthService(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        IJwtTokenService jwtTokenService,
        IProfileService profileService,
        IOptions<JwtOptions> jwtOptions,
        ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _profileService = profileService;
        _jwtOptions = jwtOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Регистрирует нового пользователя с хешированием пароля и немедленной выдачей токена.
    /// </summary>
    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);

        if (await _dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken))
        {
            return new AuthResult { Type = AuthResultType.EmailAlreadyTaken };
        }

        var user = new User
        {
            UserName = request.UserName.Trim(),
            Email = email
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResult
        {
            Type = AuthResultType.Succeeded,
            Response = await BuildAuthResponseAsync(user, cancellationToken)
        };
    }

    /// <summary>
    /// Выполняет вход по email и паролю; при дубликатах email в БД возвращает ошибку целостности.
    /// </summary>
    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var candidates = await _dbContext.Users
            .Include(user => user.Group)
            .Where(user => user.Email == email)
            .Take(MaxLoginCandidates)
            .ToListAsync(cancellationToken);

        if (candidates.Count > 1)
        {
            _logger.LogError("Multiple users share email {Email}; expected unique index on Users.Email.", email);
            return new AuthResult { Type = AuthResultType.DuplicateEmail };
        }

        var user = candidates.Count == 0 ? null : candidates[0];
        if (user is null || string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return new AuthResult { Type = AuthResultType.UserNotFound };
        }

        if (!VerifyPassword(user, request.Password))
        {
            return new AuthResult { Type = AuthResultType.InvalidPassword };
        }

        return new AuthResult
        {
            Type = AuthResultType.Succeeded,
            Response = await BuildAuthResponseAsync(user, cancellationToken)
        };
    }

    /// <summary>
    /// Сверяет пароль с хешем; некорректный формат хеша трактуется как неверные учётные данные.
    /// </summary>
    private bool VerifyPassword(User user, string password)
    {
        try
        {
            return _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password)
                   != PasswordVerificationResult.Failed;
        }
        catch (FormatException exception)
        {
            _logger.LogWarning(exception, "Invalid password hash format for user id {UserId}.", user.Id);
            return false;
        }
    }

    /// <summary>
    /// Собирает полный ответ авторизации: JWT, срок действия и данные профиля.
    /// </summary>
    private async Task<AuthResponse> BuildAuthResponseAsync(User user, CancellationToken cancellationToken)
    {
        var profile = await _profileService.MapToProfileResponseAsync(user, cancellationToken);
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
            TeamScore = profile.TeamScore,
            UserPoints = profile.UserPoints,
            PersonalRating = profile.PersonalRating,
            PersonalRank = profile.PersonalRank,
            PersonalContribution = profile.PersonalContribution,
            PersonalLeague = profile.PersonalLeague
        };
    }

    /// <summary>
    /// Нормализует email для сравнения и хранения.
    /// </summary>
    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
