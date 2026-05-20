using Microsoft.EntityFrameworkCore;
using TeamExamProject.Data;

namespace TeamExamProject.Services;

public class AdminUserService : IAdminUserService
{
    private readonly AppDbContext _dbContext;

    public AdminUserService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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
        return true;
    }
}
