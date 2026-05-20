using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Achievements;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Каталог ачивок и ачивки пользователя.
/// </summary>
[Route("api")]
[Authorize]
public class AchievementsController : ApiControllerBase
{
    private readonly IAchievementsService _achievements;

    public AchievementsController(IAchievementsService achievements)
    {
        _achievements = achievements;
    }

    /// <summary>Каталог всех ачивок.</summary>
    [HttpGet("achievements")]
    [ProducesResponseType<IEnumerable<AchievementResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AchievementResponse>>> GetCatalog(CancellationToken cancellationToken)
    {
        return Ok(await _achievements.GetCatalogAsync(cancellationToken));
    }

    /// <summary>Ачивки пользователя по идентификатору.</summary>
    [HttpGet("users/{userId:int}/achievements")]
    [ProducesResponseType<IEnumerable<UserAchievementResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserAchievementResponse>>> GetUserAchievements(int userId, CancellationToken cancellationToken)
    {
        return Ok(await _achievements.GetUserAchievementsAsync(userId, cancellationToken));
    }

    /// <summary>Ачивки текущего пользователя.</summary>
    [HttpGet("users/me/achievements")]
    [ProducesResponseType<IEnumerable<UserAchievementResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<UserAchievementResponse>>> GetMyAchievements(CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }
        return Ok(await _achievements.GetUserAchievementsAsync(userId.Value, cancellationToken));
    }
}
