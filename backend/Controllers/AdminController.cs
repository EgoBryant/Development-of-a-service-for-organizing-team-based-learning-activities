using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Admin;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Минимальная админская поверхность для MVP: правка очков, пересчёт КРК, модерация постов биржи знаний.
/// </summary>
[Route("api/admin")]
[Authorize(Roles = Roles.Admin)]
public class AdminController : ApiControllerBase
{
    private readonly IAdminUserService _adminUserService;
    private readonly IKrkCalculationService _krkCalculationService;
    private readonly IKnowledgePostsService _knowledgePostsService;

    public AdminController(
        IAdminUserService adminUserService,
        IKrkCalculationService krkCalculationService,
        IKnowledgePostsService knowledgePostsService)
    {
        _adminUserService = adminUserService;
        _krkCalculationService = krkCalculationService;
        _knowledgePostsService = knowledgePostsService;
    }

    /// <summary>Обновляет персональные баллы пользователя.</summary>
    [HttpPatch("users/{userId:int}/points")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserPoints(int userId, AdminUpdateUserPointsDto request, CancellationToken cancellationToken)
    {
        var updated = await _adminUserService.UpdatePointsAsync(userId, request.UserPoints, cancellationToken);
        if (!updated)
        {
            return NotFound(Problem(
                title: "User not found",
                detail: $"User {userId} was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }
        return NoContent();
    }

    /// <summary>Полный пересчёт КРК для всех команд.</summary>
    [HttpPost("krk/recalculate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RecalculateKrk(CancellationToken cancellationToken)
    {
        await _krkCalculationService.RecalculateAllAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>Удаляет публикацию биржи знаний.</summary>
    [HttpDelete("knowledge-posts/{postId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ModeratePost(int postId, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId ?? 0;
        var deleted = await _knowledgePostsService.DeleteOwnAsync(userId, postId, isAdmin: true, cancellationToken);
        if (!deleted)
        {
            return NotFound(Problem(
                title: "Post not found",
                detail: $"Knowledge post {postId} was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }
        return NoContent();
    }
}
