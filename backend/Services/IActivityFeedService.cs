using TeamExamProject.Contracts.ActivityFeed;

namespace TeamExamProject.Services;

public interface IActivityFeedService
{
    Task<IReadOnlyCollection<ActivityFeedItemResponse>> GetRecentAsync(int limit = 50, CancellationToken cancellationToken = default);
    Task AppendAsync(string type, string message, int? teamId = null, int? userId = null, CancellationToken cancellationToken = default);
}
