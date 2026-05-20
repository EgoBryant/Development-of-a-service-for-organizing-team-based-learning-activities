using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.ActivityFeed;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Лента активности игры.
/// </summary>
[Route("api/activity-feed")]
[Authorize]
public class ActivityFeedController : ApiControllerBase
{
    private readonly IActivityFeedService _activityFeed;

    public ActivityFeedController(IActivityFeedService activityFeed)
    {
        _activityFeed = activityFeed;
    }

    /// <summary>Возвращает последние события (по умолчанию 50).</summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<ActivityFeedItemResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ActivityFeedItemResponse>>> Get(
        [FromQuery] int? limit,
        CancellationToken cancellationToken)
    {
        var actualLimit = limit ?? 50;
        return Ok(await _activityFeed.GetRecentAsync(actualLimit, cancellationToken));
    }
}
