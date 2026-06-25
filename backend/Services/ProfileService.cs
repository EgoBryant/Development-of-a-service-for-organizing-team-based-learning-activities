using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Options;

namespace TeamExamProject.Services;

/// <summary>
/// Профиль пользователя: чтение, обновление, персональный рейтинг и лига.
/// </summary>
public class ProfileService : IProfileService
{
    /// <summary>Максимальный размер файла аватара после декодирования data URL (2 МБ).</summary>
    private const int MaxAvatarFileBytes = 2 * 1024 * 1024;

    /// <summary>Запас по длине строки data URL (~2.8M символов для 2 МБ JPEG).</summary>
    private const int MaxAvatarUrlChars = 2_800_000;

    private readonly AppDbContext _dbContext;
    private readonly LeagueOptions _leagueOptions;
    private readonly IAchievementsService _achievementsService;

    /// <summary>
    /// Создаёт сервис профиля с порогами лиг из конфигурации.
    /// </summary>
    public ProfileService(
        AppDbContext dbContext,
        IOptions<LeagueOptions> leagueOptions,
        IAchievementsService achievementsService)
    {
        _dbContext = dbContext;
        _leagueOptions = leagueOptions.Value;
        _achievementsService = achievementsService;
    }

    /// <summary>
    /// Возвращает профиль пользователя по идентификатору или <c>null</c>, если не найден.
    /// </summary>
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

    /// <summary>
    /// Собирает DTO профиля с командой, персональным рейтингом, рангом и лигой.
    /// </summary>
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

        var personalContribution = await CalculatePersonalContributionAsync(user.Id, cancellationToken);
        var personalRating = CalculatePersonalRating(user.UserPoints, personalContribution);
        var personalRank = await CalculatePersonalRankAsync(user.Id, personalRating, cancellationToken);

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
            TeamScore = team?.Score ?? 0,
            UserPoints = user.UserPoints,
            PersonalRating = personalRating,
            PersonalRank = personalRank,
            PersonalContribution = personalContribution,
            PersonalLeague = ResolvePersonalLeague(personalRating)
        };
    }

    /// <summary>
    /// Обновляет поля профиля с валидацией аватара, группы и уникальности студенческого билета.
    /// </summary>
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

        if (!IsAvatarPayloadWithinSizeLimit(avatar))
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

        if (ProfileCompletion.IsComplete(user))
        {
            await _achievementsService.GrantIfMissingAsync(user.Id, AchievementCodes.FirstCheckIn, cancellationToken);
        }

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

    /// <summary>
    /// Ищет идентификатор группы по нормализованному названию.
    /// </summary>
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

    /// <summary>
    /// Возвращает положительный идентификатор или <c>null</c>.
    /// </summary>
    private static int? OptionalPositiveId(int? value) =>
        value is > 0 ? value : null;

    /// <summary>
    /// Нормализует ключ группы для сравнения.
    /// </summary>
    private static string NormalizeGroupKey(string title) =>
        title.Trim().ToUpperInvariant();

    /// <summary>
    /// Средняя оценка вклада пользователя по голосам коллег (шкала 1–5).
    /// </summary>
    private async Task<double> CalculatePersonalContributionAsync(int userId, CancellationToken cancellationToken)
    {
        var votes = await _dbContext.Votes
            .AsNoTracking()
            .Where(vote => vote.ToUserId == userId)
            .Select(vote => vote.Score)
            .ToListAsync(cancellationToken);

        return votes.Count == 0 ? 0d : Math.Round(votes.Average(), 1);
    }

    /// <summary>
    /// Персональный рейтинг: баллы + вклад × 20.
    /// </summary>
    private static int CalculatePersonalRating(int userPoints, double personalContribution) =>
        userPoints + (int)Math.Round(personalContribution * 20d, MidpointRounding.AwayFromZero);

    /// <summary>
    /// Определяет лигу по порогам из конфигурации.
    /// </summary>
    private string ResolvePersonalLeague(int personalRating)
    {
        if (personalRating >= _leagueOptions.GoldThreshold) return _leagueOptions.GoldLabel;
        if (personalRating >= _leagueOptions.SilverThreshold) return _leagueOptions.SilverLabel;
        if (personalRating >= _leagueOptions.BronzeThreshold) return _leagueOptions.BronzeLabel;
        return _leagueOptions.BaseLabel;
    }

    /// <summary>
    /// Место пользователя среди студентов (админы исключены); при равенстве рейтинга выше тот, у кого меньший Id.
    /// </summary>
    private async Task<int> CalculatePersonalRankAsync(int userId, int personalRating, CancellationToken cancellationToken)
    {
        var allPoints = await _dbContext.Users
            .AsNoTracking()
            .Where(u => u.Role != Roles.Admin)
            .Select(u => new { u.Id, u.UserPoints })
            .ToListAsync(cancellationToken);

        var voteSums = await _dbContext.Votes
            .AsNoTracking()
            .GroupBy(v => v.ToUserId)
            .Select(g => new { UserId = g.Key, Avg = g.Average(v => (double)v.Score) })
            .ToDictionaryAsync(x => x.UserId, x => x.Avg, cancellationToken);

        var higherCount = allPoints.Count(u =>
        {
            var contrib = voteSums.GetValueOrDefault(u.Id);
            var rating = u.UserPoints + (int)Math.Round(contrib * 20d, MidpointRounding.AwayFromZero);
            return rating > personalRating || (rating == personalRating && u.Id < userId);
        });

        return higherCount + 1;
    }

    /// <summary>
    /// Перезагружает пользователя из БД и строит профиль.
    /// </summary>
    private async Task<UserProfileResponse> BuildProfileAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .Include(existingUser => existingUser.Group)
            .SingleAsync(existingUser => existingUser.Id == userId, cancellationToken);

        return await MapToProfileResponseAsync(user, cancellationToken);
    }

    /// <summary>
    /// Проверяет размер base64-аватара в data URL.
    /// </summary>
    private static bool IsAvatarPayloadWithinSizeLimit(string avatar)
    {
        if (string.IsNullOrWhiteSpace(avatar))
        {
            return true;
        }

        if (!avatar.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var commaIndex = avatar.IndexOf(',');
        if (commaIndex < 0 || commaIndex >= avatar.Length - 1)
        {
            return false;
        }

        try
        {
            var bytes = Convert.FromBase64String(avatar[(commaIndex + 1)..]);
            return bytes.Length <= MaxAvatarFileBytes;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
