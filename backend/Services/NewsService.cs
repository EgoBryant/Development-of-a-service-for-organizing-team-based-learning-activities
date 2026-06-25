using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.News;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Новости платформы: публикация, список и удаление.
/// </summary>
public class NewsService : INewsService
{
    private readonly AppDbContext _dbContext;

    /// <summary>
    /// Создаёт сервис новостей.
    /// </summary>
    public NewsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Возвращает новости, отсортированные по дате публикации (опционально с лимитом).
    /// </summary>
    public async Task<IReadOnlyCollection<NewsResponse>> GetAllAsync(int? limit, CancellationToken cancellationToken = default)
    {
        IQueryable<NewsItem> query = _dbContext.NewsItems
            .AsNoTracking()
            .OrderByDescending(news => news.PublishedAtUtc);

        if (limit is > 0)
        {
            query = query.Take(limit.Value);
        }

        var items = await query.ToListAsync(cancellationToken);
        return items.Select(Map).ToList();
    }

    /// <summary>
    /// Публикует новую новость с текущей меткой времени UTC.
    /// </summary>
    public async Task<NewsResponse> CreateAsync(CreateNewsDto request, CancellationToken cancellationToken = default)
    {
        var news = new NewsItem
        {
            Title = request.Title.Trim(),
            Body = request.Body.Trim(),
            PublishedAtUtc = DateTime.UtcNow
        };
        _dbContext.NewsItems.Add(news);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(news);
    }

    /// <summary>
    /// Удаляет новость по идентификатору.
    /// </summary>
    /// <returns><c>true</c>, если запись найдена и удалена.</returns>
    public async Task<bool> DeleteAsync(int newsId, CancellationToken cancellationToken = default)
    {
        var news = await _dbContext.NewsItems.SingleOrDefaultAsync(item => item.Id == newsId, cancellationToken);
        if (news is null)
        {
            return false;
        }

        _dbContext.NewsItems.Remove(news);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <summary>
    /// Преобразует сущность новости в DTO ответа.
    /// </summary>
    private static NewsResponse Map(NewsItem news) => new()
    {
        Id = news.Id,
        Title = news.Title,
        Body = news.Body,
        PublishedAtUtc = news.PublishedAtUtc
    };
}
