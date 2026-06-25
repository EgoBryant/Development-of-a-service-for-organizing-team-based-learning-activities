using Microsoft.EntityFrameworkCore;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Административные операции над пользователями (ручная корректировка баллов).
/// </summary>
public class AdminUserService : IAdminUserService
{
    private readonly AppDbContext _dbContext;
    private readonly IAchievementsService _achievementsService;

    /// <summary>
    /// Создаёт сервис администрирования пользователей.
    /// </summary>
    public AdminUserService(AppDbContext dbContext, IAchievementsService achievementsService)
    {
        _dbContext = dbContext;
        _achievementsService = achievementsService;
    }

    /// <summary>
    /// Обновляет персональные баллы пользователя по идентификатору.
    /// </summary>
    /// <returns><c>true</c>, если пользователь найден и баллы сохранены.</returns>
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

    /// <summary>
    /// Обновляет персональные баллы пользователя по email (нормализованному).
    /// </summary>
    /// <returns><c>true</c>, если пользователь найден и баллы сохранены.</returns>
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
