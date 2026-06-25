using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Assignments;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class AssignmentsService : IAssignmentsService
{
    private static readonly HashSet<string> ValidLeagueTiers = new(StringComparer.OrdinalIgnoreCase)
    {
        "novice",
        "pro",
        "legend"
    };

    private readonly AppDbContext _dbContext;

    public AssignmentsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<AssignmentResponse>> GetFeedAsync(
        string? leagueTier,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Assignments
            .AsNoTracking()
            .Where(assignment => assignment.IsActive);

        if (!string.IsNullOrWhiteSpace(leagueTier) && ValidLeagueTiers.Contains(leagueTier))
        {
            var normalizedTier = leagueTier.Trim().ToLowerInvariant();
            query = query.Where(assignment => assignment.LeagueTier == normalizedTier);
        }

        var items = await query
            .OrderBy(assignment => assignment.DeadlineUtc ?? DateTime.MaxValue)
            .ThenBy(assignment => assignment.Id)
            .ToListAsync(cancellationToken);

        return items.Select(Map).ToList();
    }

    public async Task<AssignmentResponse?> CreateAsync(
        CreateAssignmentDto request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.LeagueTier) || !ValidLeagueTiers.Contains(request.LeagueTier))
        {
            return null;
        }

        var assignment = new Assignment
        {
            Title = request.Title.Trim(),
            Tag = request.Tag.Trim(),
            Description = request.Description.Trim(),
            DeadlineLabel = request.DeadlineLabel.Trim(),
            DeadlineUtc = request.DeadlineUtc,
            LeagueTier = request.LeagueTier.Trim().ToLowerInvariant(),
            IsActive = true,
            IsAvailableInFeed = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Assignments.Add(assignment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(assignment);
    }

    public async Task<AssignmentResponse?> ReserveForFeedAsync(int assignmentId, CancellationToken cancellationToken = default)
    {
        var assignment = await _dbContext.Assignments
            .SingleOrDefaultAsync(item => item.Id == assignmentId && item.IsActive, cancellationToken);

        if (assignment is null || !assignment.IsAvailableInFeed)
        {
            return null;
        }

        assignment.IsAvailableInFeed = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(assignment);
    }

    public async Task<bool> ReleaseFromFeedAsync(int assignmentId, CancellationToken cancellationToken = default)
    {
        var assignment = await _dbContext.Assignments
            .SingleOrDefaultAsync(item => item.Id == assignmentId && item.IsActive, cancellationToken);

        if (assignment is null)
        {
            return false;
        }

        if (!assignment.IsAvailableInFeed)
        {
            assignment.IsAvailableInFeed = true;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return true;
    }

    private static AssignmentResponse Map(Assignment assignment) => new()
    {
        Id = assignment.Id,
        Title = assignment.Title,
        Tag = assignment.Tag,
        Description = assignment.Description,
        DeadlineLabel = assignment.DeadlineLabel,
        DeadlineUtc = assignment.DeadlineUtc,
        LeagueTier = assignment.LeagueTier,
        IsAvailableInFeed = assignment.IsAvailableInFeed
    };
}
