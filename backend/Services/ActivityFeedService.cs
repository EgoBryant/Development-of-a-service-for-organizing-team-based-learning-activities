using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.ActivityFeed;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class ActivityFeedService : IActivityFeedService
{
    private readonly AppDbContext _dbContext;

    public ActivityFeedService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<ActivityFeedItemResponse>> GetRecentAsync(int limit = 50, CancellationToken cancellationToken = default)
    {
        var safeLimit = Math.Clamp(limit, 1, 200);

        var items = await _dbContext.ActivityFeedItems
            .AsNoTracking()
            .Include(item => item.Team)
            .Include(item => item.User)
            .OrderByDescending(item => item.CreatedAtUtc)
            .Take(safeLimit)
            .ToListAsync(cancellationToken);

        return items.Select(Map).ToList();
    }

    public async Task AppendAsync(string type, string message, int? teamId = null, int? userId = null, CancellationToken cancellationToken = default)
    {
        var item = new ActivityFeedItem
        {
            Type = type,
            Message = message.Length > 500 ? message[..500] : message,
            TeamId = teamId,
            UserId = userId,
            CreatedAtUtc = DateTime.UtcNow
        };
        _dbContext.ActivityFeedItems.Add(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static ActivityFeedItemResponse Map(ActivityFeedItem item) => new()
    {
        Id = item.Id,
        Type = item.Type,
        Message = item.Message,
        TeamId = item.TeamId,
        TeamName = item.Team?.Name ?? string.Empty,
        UserId = item.UserId,
        UserName = item.User?.UserName ?? string.Empty,
        CreatedAtUtc = item.CreatedAtUtc
    };
}
