using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.News;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class NewsService : INewsService
{
    private readonly AppDbContext _dbContext;

    public NewsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

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

    private static NewsResponse Map(NewsItem news) => new()
    {
        Id = news.Id,
        Title = news.Title,
        Body = news.Body,
        PublishedAtUtc = news.PublishedAtUtc
    };
}
