using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Knowledge;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Эндпоинты биржи знаний для публикации и просмотра экспертных объявлений.
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
    /// Возвращает все публикации биржи знаний с фильтрами.
    /// </summary>
    /// <param name="search">Подстрока в title/description (регистронезависимый поиск).</param>
    /// <param name="type">Точное совпадение тега/типа: «Java», «Матан», ...</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Список объявлений с автором и связанной командой.</returns>
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
    /// Создает новую публикацию на бирже знаний от имени текущего пользователя.
    /// </summary>
    /// <param name="request">Заголовок, описание и категория публикации.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Созданная публикация.</returns>
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
    /// Удаляет публикацию (автор или администратор).
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
