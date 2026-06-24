using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Achievements;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class AchievementsService : IAchievementsService
{
    private readonly AppDbContext _dbContext;
    private readonly IActivityFeedService _activityFeed;

    public AchievementsService(AppDbContext dbContext, IActivityFeedService activityFeed)
    {
        _dbContext = dbContext;
        _activityFeed = activityFeed;
    }

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

    public async Task<IReadOnlyCollection<UserAchievementResponse>> GetUserAchievementsAsync(int userId, CancellationToken cancellationToken = default)
    {
        await EnsureTop3TeamAchievementAsync(userId, cancellationToken);

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

    private async Task EnsureTop3TeamAchievementAsync(int userId, CancellationToken cancellationToken)
    {
        var teamId = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.TeamId)
            .SingleOrDefaultAsync(cancellationToken);

        if (teamId is null)
        {
            return;
        }

        var topTeamIds = await _dbContext.Teams
            .AsNoTracking()
            .OrderByDescending(team => team.KrkCached)
            .ThenByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .Select(team => team.Id)
            .Take(3)
            .ToListAsync(cancellationToken);

        if (!topTeamIds.Contains(teamId.Value))
        {
            return;
        }

        await GrantIfMissingAsync(userId, AchievementCodes.Top3Team, cancellationToken);
    }
}
