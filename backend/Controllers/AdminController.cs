using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Admin;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Административные операции MVP: правка баллов пользователей, пересчёт КРК, модерация биржи знаний.
/// Базовый маршрут: <c>api/admin</c>. Все методы требуют JWT с ролью <c>Admin</c>.
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

    /// <summary>
    /// PATCH <c>api/admin/users/{userId}/points</c> — обновляет персональные баллы пользователя по идентификатору.
    /// Требуется роль Admin. 204 при успехе; 404, если пользователь не найден.
    /// </summary>
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

    /// <summary>
    /// PATCH <c>api/admin/users/by-email/points</c> — обновляет персональные баллы пользователя по email.
    /// Требуется роль Admin. 204 при успехе; 404, если пользователь с указанным email не найден.
    /// </summary>
    [HttpPatch("users/by-email/points")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserPointsByEmail(AdminUpdateUserPointsByEmailDto request, CancellationToken cancellationToken)
    {
        var updated = await _adminUserService.UpdatePointsByEmailAsync(request.Email, request.UserPoints, cancellationToken);
        if (!updated)
        {
            return NotFound(Problem(
                title: "User not found",
                detail: $"User with email '{request.Email}' was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }
        return NoContent();
    }

    /// <summary>
    /// POST <c>api/admin/krk/recalculate</c> — запускает полный пересчёт КРК для всех команд.
    /// Требуется роль Admin. Возвращает 204 No Content после завершения.
    /// </summary>
    [HttpPost("krk/recalculate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RecalculateKrk(CancellationToken cancellationToken)
    {
        await _krkCalculationService.RecalculateAllAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// DELETE <c>api/admin/knowledge-posts/{postId}</c> — удаляет публикацию биржи знаний (модерация).
    /// Требуется роль Admin. 204 при успехе; 404, если пост не найден.
    /// </summary>
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
