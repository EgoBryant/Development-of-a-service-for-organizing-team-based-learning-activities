using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Knowledge;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class KnowledgePostsService : IKnowledgePostsService
{
    private readonly AppDbContext _dbContext;

    public KnowledgePostsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<KnowledgePostResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var posts = await _dbContext.KnowledgePosts
            .AsNoTracking()
            .Include(post => post.User)
            .Include(post => post.Team)
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

        return await _dbContext.KnowledgePosts
            .AsNoTracking()
            .Include(existingPost => existingPost.User)
            .Include(existingPost => existingPost.Team)
            .Where(existingPost => existingPost.Id == post.Id)
            .Select(existingPost => Map(existingPost))
            .SingleAsync(cancellationToken);
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
