using Microsoft.EntityFrameworkCore;
using TeamExamProject.Data;

namespace TeamExamProject.Services;

/// <summary>
/// Административные операции над пользователями (ручная корректировка баллов).
/// </summary>
public class AdminUserService : IAdminUserService
{
    private readonly AppDbContext _dbContext;

    /// <summary>
    /// Создаёт сервис администрирования пользователей.
    /// </summary>
    public AdminUserService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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
        return true;
    }
}
