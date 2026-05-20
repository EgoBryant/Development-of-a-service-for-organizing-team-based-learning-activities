using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Knowledge;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class KnowledgePostsService : IKnowledgePostsService
{
    private readonly AppDbContext _dbContext;
    private readonly IActivityFeedService _activityFeed;

    public KnowledgePostsService(AppDbContext dbContext, IActivityFeedService activityFeed)
    {
        _dbContext = dbContext;
        _activityFeed = activityFeed;
    }

    public async Task<IReadOnlyCollection<KnowledgePostResponse>> GetAllAsync(KnowledgePostQuery query, CancellationToken cancellationToken = default)
    {
        IQueryable<KnowledgePost> source = _dbContext.KnowledgePosts
            .AsNoTracking()
            .Include(post => post.User)
            .Include(post => post.Team);

        if (!string.IsNullOrWhiteSpace(query.Type))
        {
            var type = query.Type.Trim();
            source = source.Where(post => post.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var needle = query.Search.Trim();
            source = source.Where(post => EF.Functions.ILike(post.Title, $"%{needle}%")
                                          || EF.Functions.ILike(post.Description, $"%{needle}%"));
        }

        var posts = await source
            .OrderByDescending(post => post.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return posts.Select(Map).ToList();
    }

    public async Task<KnowledgePostResponse?> CreateAsync(int userId, CreateKnowledgePostDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var post = new KnowledgePost
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Type = request.Type.Trim(),
            UserId = user.Id,
            TeamId = request.PublishToTeam ? user.TeamId : null,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.KnowledgePosts.Add(post);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.KnowledgePostCreated,
            $"Опубликовано объявление «{post.Title}» в Бирже знаний.",
            post.TeamId,
            user.Id,
            cancellationToken);

        return await _dbContext.KnowledgePosts
            .AsNoTracking()
            .Include(existingPost => existingPost.User)
            .Include(existingPost => existingPost.Team)
            .Where(existingPost => existingPost.Id == post.Id)
            .Select(existingPost => Map(existingPost))
            .SingleAsync(cancellationToken);
    }

    public async Task<bool> DeleteOwnAsync(int userId, int postId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var post = await _dbContext.KnowledgePosts.SingleOrDefaultAsync(existing => existing.Id == postId, cancellationToken);
        if (post is null)
        {
            return false;
        }

        if (!isAdmin && post.UserId != userId)
        {
            return false;
        }

        _dbContext.KnowledgePosts.Remove(post);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static KnowledgePostResponse Map(KnowledgePost post)
    {
        return new KnowledgePostResponse
        {
            Id = post.Id,
            Title = post.Title,
            Description = post.Description,
            Type = post.Type,
            UserId = post.UserId,
            UserName = post.User?.UserName ?? string.Empty,
            TeamId = post.TeamId,
            TeamName = post.Team?.Name ?? string.Empty,
            CreatedAtUtc = post.CreatedAtUtc
        };
    }
}
