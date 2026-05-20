using TeamExamProject.Contracts.News;

namespace TeamExamProject.Services;

public interface INewsService
{
    Task<IReadOnlyCollection<NewsResponse>> GetAllAsync(int? limit, CancellationToken cancellationToken = default);
    Task<NewsResponse> CreateAsync(CreateNewsDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int newsId, CancellationToken cancellationToken = default);
}
