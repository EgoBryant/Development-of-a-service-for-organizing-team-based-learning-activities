using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Achievements;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Каталог достижений (ачивок) и ачивки пользователей.
/// Базовый маршрут: <c>api</c>. Все методы требуют JWT.
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

    /// <summary>
    /// GET <c>api/achievements</c> — возвращает полный каталог всех ачивок платформы.
    /// Требуется JWT. 200 со списком ачивок.
    /// </summary>
    [HttpGet("achievements")]
    [ProducesResponseType<IEnumerable<AchievementResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AchievementResponse>>> GetCatalog(CancellationToken cancellationToken)
    {
        return Ok(await _achievements.GetCatalogAsync(cancellationToken));
    }

    /// <summary>
    /// GET <c>api/users/{userId}/achievements</c> — возвращает ачивки указанного пользователя.
    /// Требуется JWT. 200 со списком полученных ачивок.
    /// </summary>
    [HttpGet("users/{userId:int}/achievements")]
    [ProducesResponseType<IEnumerable<UserAchievementResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserAchievementResponse>>> GetUserAchievements(int userId, CancellationToken cancellationToken)
    {
        return Ok(await _achievements.GetUserAchievementsAsync(userId, cancellationToken));
    }

    /// <summary>
    /// GET <c>api/users/me/achievements</c> — возвращает ачивки текущего пользователя.
    /// Требуется JWT. 200 со списком; 401, если идентификатор из токена недоступен.
    /// </summary>
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
