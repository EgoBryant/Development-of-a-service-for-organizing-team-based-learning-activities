using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamExamProject.Contracts.News;
using TeamExamProject.Models;
using TeamExamProject.Services;

namespace TeamExamProject.Controllers;

/// <summary>
/// Новости организатора игры (лента).
/// </summary>
[Route("api/news")]
public class NewsController : ApiControllerBase
{
    private readonly INewsService _newsService;

    public NewsController(INewsService newsService)
    {
        _newsService = newsService;
    }

    /// <summary>Возвращает новости. Параметр <c>limit</c> — ограничение количества (опционально).</summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType<IEnumerable<NewsResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<NewsResponse>>> GetAll([FromQuery] int? limit, CancellationToken cancellationToken)
    {
        return Ok(await _newsService.GetAllAsync(limit, cancellationToken));
    }

    /// <summary>Создает новость. Доступно администратору.</summary>
    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType<NewsResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<NewsResponse>> Create(CreateNewsDto request, CancellationToken cancellationToken)
    {
        var created = await _newsService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    /// <summary>Удаляет новость. Доступно администратору.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = Roles.Admin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _newsService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(Problem(title: "News not found", detail: $"News {id} was not found.", statusCode: StatusCodes.Status404NotFound));
        }
        return NoContent();
    }
}
