using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Options;

namespace TeamExamProject.Services;

public class AuthService : IAuthService
{
    private const int MaxLoginCandidates = 3;

    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IProfileService _profileService;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthService> _logger;

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
            return new AuthResult { Type = AuthResultType.InvalidCredentials };
        }

        if (!VerifyPassword(user, request.Password))
        {
            return new AuthResult { Type = AuthResultType.InvalidCredentials };
        }

        return new AuthResult
        {
            Type = AuthResultType.Succeeded,
            Response = await BuildAuthResponseAsync(user, cancellationToken)
        };
    }

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
            TeamScore = profile.TeamScore
        };
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
