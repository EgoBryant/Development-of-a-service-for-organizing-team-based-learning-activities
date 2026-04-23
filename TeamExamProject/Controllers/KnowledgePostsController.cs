using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.Knowledge;
using TeamExamProject.Infrastructure.Authorization;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Эндпоинты биржи знаний для публикации и просмотра экспертных объявлений.
/// </summary>
[ApiController]
[Route("api/knowledge-posts")]
[Authorize]
public class KnowledgePostsController : ControllerBase
{
    private readonly IKnowledgePostsService _knowledgePostsService;

    public KnowledgePostsController(IKnowledgePostsService knowledgePostsService)
    {
        _knowledgePostsService = knowledgePostsService;
    }

    /// <summary>
    /// Возвращает все публикации биржи знаний.
    /// </summary>
    /// <returns>Список объявлений с автором и связанной командой.</returns>
    [HttpGet]
    [ProducesResponseType<IEnumerable<KnowledgePostResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<KnowledgePostResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _knowledgePostsService.GetAllAsync(cancellationToken));
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
        var userId = User.GetUserId();
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
}
