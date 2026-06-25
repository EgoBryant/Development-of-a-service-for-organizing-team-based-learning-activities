using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Achievements;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Управление каталогом достижений и выдачей ачивок пользователям.
/// </summary>
public class AchievementsService : IAchievementsService
{
    private readonly AppDbContext _dbContext;
    private readonly IActivityFeedService _activityFeed;

    /// <summary>
    /// Создаёт сервис достижений.
    /// </summary>
    public AchievementsService(AppDbContext dbContext, IActivityFeedService activityFeed)
    {
        _dbContext = dbContext;
        _activityFeed = activityFeed;
    }

    /// <summary>
    /// Возвращает полный каталог достижений платформы.
    /// </summary>
    public async Task<IReadOnlyCollection<AchievementResponse>> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        var items = await _dbContext.Achievements
            .AsNoTracking()
            .OrderBy(achievement => achievement.Code)
            .ToListAsync(cancellationToken);

        return items.Select(achievement => new AchievementResponse
        {
            Id = achievement.Id,
            Code = achievement.Code,
            Title = achievement.Title,
            Description = achievement.Description,
            IconUrl = achievement.IconUrl
        }).ToList();
    }

    /// <summary>
    /// Возвращает достижения пользователя; перед выдачей проверяет право на ачивку «Топ-3 команды».
    /// </summary>
    public async Task<IReadOnlyCollection<UserAchievementResponse>> GetUserAchievementsAsync(int userId, CancellationToken cancellationToken = default)
    {
        await EnsureEligibleAchievementsAsync(userId, cancellationToken);

        var items = await _dbContext.UserAchievements
            .AsNoTracking()
            .Include(userAchievement => userAchievement.Achievement)
            .Where(userAchievement => userAchievement.UserId == userId)
            .OrderByDescending(userAchievement => userAchievement.EarnedAtUtc)
            .ToListAsync(cancellationToken);

        return items.Select(userAchievement => new UserAchievementResponse
        {
            Id = userAchievement.Id,
            UserId = userAchievement.UserId,
            AchievementId = userAchievement.AchievementId,
            Code = userAchievement.Achievement?.Code ?? string.Empty,
            Title = userAchievement.Achievement?.Title ?? string.Empty,
            Description = userAchievement.Achievement?.Description ?? string.Empty,
            IconUrl = userAchievement.Achievement?.IconUrl ?? string.Empty,
            EarnedAtUtc = userAchievement.EarnedAtUtc
        }).ToList();
    }

    /// <summary>
    /// Выдаёт достижение по коду, если у пользователя его ещё нет; публикует событие в ленту активности.
    /// </summary>
    /// <returns><c>true</c>, если ачивка была выдана впервые.</returns>
    public async Task<bool> GrantIfMissingAsync(int userId, string achievementCode, CancellationToken cancellationToken = default)
    {
        var achievement = await _dbContext.Achievements
            .SingleOrDefaultAsync(existing => existing.Code == achievementCode, cancellationToken);
        if (achievement is null)
        {
            return false;
        }

        var existsForUser = await _dbContext.UserAchievements
            .AnyAsync(userAchievement => userAchievement.UserId == userId && userAchievement.AchievementId == achievement.Id, cancellationToken);
        if (existsForUser)
        {
            return false;
        }

        _dbContext.UserAchievements.Add(new UserAchievement
        {
            UserId = userId,
            AchievementId = achievement.Id,
            EarnedAtUtc = DateTime.UtcNow
        });
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.AchievementEarned,
            $"Игрок получил ачивку «{achievement.Title}».",
            null,
            userId,
            cancellationToken);

        return true;
    }

    /// <summary>
    /// Проверяет, входит ли команда пользователя в топ-3 по КРК, и выдаёт соответствующую ачивку.
    /// </summary>
    private async Task EnsureEligibleAchievementsAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(existing => existing.Id == userId, cancellationToken);
        if (user is null)
        {
            return;
        }

        if (ProfileCompletion.IsComplete(user))
        {
            await GrantIfMissingAsync(userId, AchievementCodes.FirstCheckIn, cancellationToken);
        }

        if (user.TeamId is not null)
        {
            await GrantIfMissingAsync(userId, AchievementCodes.FirstVote, cancellationToken);
        }

        if (user.UserPoints > 0)
        {
            await GrantIfMissingAsync(userId, AchievementCodes.Top3Team, cancellationToken);
        }

        var hasSubmittedChallenge = await _dbContext.TeamChallengeProgresses
            .AsNoTracking()
            .AnyAsync(progress => progress.SubmittedByUserId == userId, cancellationToken);
        if (hasSubmittedChallenge)
        {
            await GrantIfMissingAsync(userId, AchievementCodes.FirstChallenge, cancellationToken);
        }

        if (user.TeamId is not null && user.Role == Roles.Captain)
        {
            var hasRescueResponse = await _dbContext.HelpRequests
                .AsNoTracking()
                .AnyAsync(
                    request =>
                        request.ToTeamId == user.TeamId &&
                        (request.Status == HelpRequestStatuses.Accepted ||
                         request.Status == HelpRequestStatuses.Completed),
                    cancellationToken);
            if (hasRescueResponse)
            {
                await GrantIfMissingAsync(userId, AchievementCodes.FirstRescue, cancellationToken);
            }
        }
    }
}
