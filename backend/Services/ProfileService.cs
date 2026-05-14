using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class ProfileService : IProfileService
{
    /// <summary>~12M символов ≈ типичный потолок для data URL крупного JPEG после base64.</summary>
    private const int MaxAvatarUrlChars = 12_000_000;

    private readonly AppDbContext _dbContext;

    public ProfileService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserProfileResponse?> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .Include(existingUser => existingUser.Group)
            .SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user is null)
        {
            return null;
        }

        return await MapToProfileResponseAsync(user, cancellationToken);
    }

    public async Task<UserProfileResponse> MapToProfileResponseAsync(User user, CancellationToken cancellationToken = default)
    {
        var team = user.TeamId is null
            ? null
            : await _dbContext.Teams
                .AsNoTracking()
                .SingleOrDefaultAsync(existingTeam => existingTeam.Id == user.TeamId.Value, cancellationToken);

        var groupTitle = !string.IsNullOrWhiteSpace(user.AcademicGroupLabel)
            ? user.AcademicGroupLabel.Trim()
            : user.Group?.Title ?? string.Empty;

        return new UserProfileResponse
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Role = string.IsNullOrWhiteSpace(user.Role) ? Roles.Student : user.Role,
            FirstName = user.FirstName,
            LastName = user.LastName,
            MiddleName = user.MiddleName,
            Nickname = user.Nickname,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            ContactEmail = user.ContactEmail,
            TelegramHandle = user.TelegramHandle,
            PhoneNumber = user.PhoneNumber,
            StudentTicketNumber = user.StudentTicketNumber,
            GroupId = user.GroupId,
            GroupTitle = groupTitle,
            TeamId = team?.Id,
            TeamName = team?.Name ?? string.Empty,
            TeamInviteCode = team?.InviteCode ?? string.Empty,
            IsCaptain = team?.CaptainId == user.Id,
            TeamScore = team?.Score ?? 0
        };
    }

    public async Task<ProfileUpdateResult> UpdateProfileAsync(int userId, UpdateProfileDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new ProfileUpdateResult { Type = ProfileUpdateResultType.UserNotFound };
        }

        var requestGroupId = OptionalPositiveId(request.GroupId);
        var studentTicket = OptionalPositiveId(request.StudentTicketNumber);

        var avatar = request.AvatarUrl.Trim();
        if (avatar.Length > MaxAvatarUrlChars)
        {
            return new ProfileUpdateResult { Type = ProfileUpdateResultType.AvatarPayloadTooLarge };
        }

        if (requestGroupId is not null)
        {
            var groupExists = await _dbContext.Groups.AnyAsync(group => group.Id == requestGroupId.Value, cancellationToken);
            if (!groupExists)
            {
                return new ProfileUpdateResult { Type = ProfileUpdateResultType.GroupNotFound };
            }
        }

        if (studentTicket is not null)
        {
            var duplicateTicket = await _dbContext.Users.AnyAsync(existingUser =>
                existingUser.Id != userId &&
                existingUser.StudentTicketNumber == studentTicket.Value,
                cancellationToken);

            if (duplicateTicket)
            {
                return new ProfileUpdateResult { Type = ProfileUpdateResultType.StudentTicketAlreadyUsed };
            }
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.MiddleName = request.MiddleName.Trim();
        user.Nickname = request.Nickname.Trim();
        user.Bio = request.Bio.Trim();
        user.AvatarUrl = avatar;
        user.ContactEmail = request.ContactEmail.Trim().ToLowerInvariant();
        user.TelegramHandle = request.TelegramHandle.Trim();
        user.PhoneNumber = request.PhoneNumber.Trim();
        user.StudentTicketNumber = studentTicket;

        if (request.AcademicGroupLabel is not null)
        {
            user.AcademicGroupLabel = request.AcademicGroupLabel.Trim();
        }

        user.GroupId = await ResolveGroupIdAsync(user.GroupId, requestGroupId, request.AcademicGroupLabel, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new ProfileUpdateResult
        {
            Type = ProfileUpdateResultType.Updated,
            Profile = await BuildProfileAsync(user.Id, cancellationToken)
        };
    }

    /// <summary>Явный выбор из справочника; иначе подбор по <paramref name="academicGroupLabel"/>; иначе оставляем ид из текущей записи.</summary>
    private async Task<int?> ResolveGroupIdAsync(
        int? currentUserGroupId,
        int? requestGroupId,
        string? academicGroupLabel,
        CancellationToken cancellationToken)
    {
        if (requestGroupId is not null)
        {
            return requestGroupId;
        }

        if (academicGroupLabel is null)
        {
            return currentUserGroupId;
        }

        var label = academicGroupLabel.Trim();
        if (string.IsNullOrEmpty(label))
        {
            return null;
        }

        return await FindGroupIdByNormalizedTitleAsync(label, cancellationToken);
    }

    private async Task<int?> FindGroupIdByNormalizedTitleAsync(string label, CancellationToken cancellationToken)
    {
        var key = NormalizeGroupKey(label);
        // Справочник небольшой; EF не переводит C#-нормализацию в SQL — сопоставление в памяти.
        var groups = await _dbContext.Groups
            .AsNoTracking()
            .Select(g => new { g.Id, g.Title })
            .ToListAsync(cancellationToken);

        return groups.FirstOrDefault(g => NormalizeGroupKey(g.Title) == key)?.Id;
    }

    private static int? OptionalPositiveId(int? value) =>
        value is > 0 ? value : null;

    private static string NormalizeGroupKey(string title) =>
        title.Trim().ToUpperInvariant();

    private async Task<UserProfileResponse> BuildProfileAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .Include(existingUser => existingUser.Group)
            .SingleAsync(existingUser => existingUser.Id == userId, cancellationToken);

        return await MapToProfileResponseAsync(user, cancellationToken);
    }
}
