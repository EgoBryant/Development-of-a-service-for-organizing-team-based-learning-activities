using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Admin;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Минимальная админская поверхность для MVP: правка очков, модерация постов биржи знаний.
/// </summary>
[Route("api/admin")]
[Authorize(Roles = Roles.Admin)]
public class AdminController : ApiControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IKrkCalculationService _krkCalculationService;
    private readonly IKnowledgePostsService _knowledgePostsService;

    public AdminController(
        AppDbContext dbContext,
        IKrkCalculationService krkCalculationService,
        IKnowledgePostsService knowledgePostsService)
    {
        _dbContext = dbContext;
        _krkCalculationService = krkCalculationService;
        _knowledgePostsService = knowledgePostsService;
    }

    /// <summary>Обновляет персональные баллы пользователя.</summary>
    [HttpPatch("users/{userId:int}/points")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserPoints(int userId, AdminUpdateUserPointsDto request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existing => existing.Id == userId, cancellationToken);
        if (user is null)
        {
            return NotFound(Problem(
                title: "User not found",
                detail: $"User {userId} was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }
        user.UserPoints = request.UserPoints;
        await _dbContext.SaveChangesAsync(cancellationToken);
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
            return NotFound(Problem(title: "Post not found", detail: $"Knowledge post {postId} was not found.", statusCode: StatusCodes.Status404NotFound));
        }
        return NoContent();
    }
}
