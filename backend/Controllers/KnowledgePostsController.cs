using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Knowledge;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Биржа знаний: peer-to-peer объявления экспертов среди студентов.
/// Базовый маршрут: <c>api/knowledge-posts</c>. Все методы требуют JWT; удаление — автор или Admin.
/// </summary>
[Route("api/knowledge-posts")]
[Authorize]
public class KnowledgePostsController : ApiControllerBase
{
    private readonly IKnowledgePostsService _knowledgePostsService;

    public KnowledgePostsController(IKnowledgePostsService knowledgePostsService)
    {
        _knowledgePostsService = knowledgePostsService;
    }

    /// <summary>
    /// GET <c>api/knowledge-posts</c> — возвращает публикации биржи знаний с фильтрами.
    /// Требуется JWT. Параметры: <c>search</c> (подстрока в title/description), <c>type</c> (тег/категория).
    /// 200 со списком объявлений с автором и командой.
    /// </summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<KnowledgePostResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<KnowledgePostResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? type,
        CancellationToken cancellationToken)
    {
        var query = new KnowledgePostQuery { Search = search, Type = type };
        return Ok(await _knowledgePostsService.GetAllAsync(query, cancellationToken));
    }

    /// <summary>
    /// POST <c>api/knowledge-posts</c> — создаёт публикацию на бирже знаний от текущего пользователя.
    /// Требуется JWT. 201 Created; 401 без токена; 404, если пользователь не найден.
    /// </summary>
    /// <param name="request">Заголовок, описание и категория публикации.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    [HttpPost]
    [ProducesResponseType<KnowledgePostResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<KnowledgePostResponse>> Create(CreateKnowledgePostDto request, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var post = await _knowledgePostsService.CreateAsync(userId.Value, request, cancellationToken);
        if (post is null)
        {
            return NotFound(Problem(
                title: "User not found",
                detail: "The current user was not found.",
                statusCode: StatusCodes.Status404NotFound));
        }

        return CreatedAtAction(nameof(GetAll), new { id = post.Id }, post);
    }

    /// <summary>
    /// DELETE <c>api/knowledge-posts/{id}</c> — удаляет публикацию.
    /// Требуется JWT; удалять может автор или Admin. 204 при успехе; 403 без прав; 404, если пост не найден.
    /// </summary>
    /// <param name="id">Идентификатор публикации.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = CurrentUserId;
        if (userId is null)
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole(Roles.Admin);
        var deleted = await _knowledgePostsService.DeleteOwnAsync(userId.Value, id, isAdmin, cancellationToken);
        if (!deleted)
        {
            return NotFound(Problem(
                title: "Post not found",
                detail: $"Knowledge post {id} was not found or you have no rights to delete it.",
                statusCode: StatusCodes.Status404NotFound));
        }
        return NoContent();
    }
}
