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
    private readonly ITeamScoreService _teamScoreService;

    /// <summary>
    /// Создаёт сервис администрирования пользователей.
    /// </summary>
    public AdminUserService(
        AppDbContext dbContext,
        IAchievementsService achievementsService,
        ITeamScoreService teamScoreService)
    {
        _dbContext = dbContext;
        _achievementsService = achievementsService;
        _teamScoreService = teamScoreService;
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

        await _achievementsService.TryGrantTop3TeamWhenTaskPointsEarnedAsync(userId, cancellationToken);
        await _teamScoreService.RecalculateForUserTeamAsync(userId, cancellationToken: cancellationToken);

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

        await _achievementsService.TryGrantTop3TeamWhenTaskPointsEarnedAsync(user.Id, cancellationToken);
        await _teamScoreService.RecalculateForUserTeamAsync(user.Id, cancellationToken: cancellationToken);

        return true;
    }
}
