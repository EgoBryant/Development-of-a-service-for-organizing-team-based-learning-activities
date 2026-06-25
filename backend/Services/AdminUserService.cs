using Microsoft.EntityFrameworkCore;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class AdminUserService : IAdminUserService
{
    private readonly AppDbContext _dbContext;
    private readonly IAchievementsService _achievementsService;

    public AdminUserService(AppDbContext dbContext, IAchievementsService achievementsService)
    {
        _dbContext = dbContext;
        _achievementsService = achievementsService;
    }

    public async Task<bool> UpdatePointsAsync(int userId, int userPoints, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existing => existing.Id == userId, cancellationToken);
        if (user is null)
        {
            return false;
        }

        user.UserPoints = userPoints;
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (userPoints > 0)
        {
            await _achievementsService.GrantIfMissingAsync(userId, AchievementCodes.Top3Team, cancellationToken);
        }

        return true;
    }

    public async Task<bool> UpdatePointsByEmailAsync(string email, int userPoints, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users.SingleOrDefaultAsync(existing => existing.Email == normalized, cancellationToken);
        if (user is null)
        {
            return false;
        }

        user.UserPoints = userPoints;
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (userPoints > 0)
        {
            await _achievementsService.GrantIfMissingAsync(user.Id, AchievementCodes.Top3Team, cancellationToken);
        }

        return true;
    }
}
