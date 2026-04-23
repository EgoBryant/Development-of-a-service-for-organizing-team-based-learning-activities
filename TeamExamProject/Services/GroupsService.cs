using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Groups;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class GroupsService : IGroupsService
{
    private readonly AppDbContext _dbContext;

    public GroupsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<GroupResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var groups = await _dbContext.Groups
            .AsNoTracking()
            .Include(group => group.Users)
            .OrderBy(group => group.Title)
            .ToListAsync(cancellationToken);

        return groups.Select(Map).ToList();
    }

    public async Task<GroupResponse> CreateAsync(CreateGroupDto request, CancellationToken cancellationToken = default)
    {
        var group = new Group
        {
            Title = request.Title.Trim(),
            Course = request.Course.Trim(),
            Faculty = request.Faculty.Trim()
        };

        _dbContext.Groups.Add(group);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Map(group);
    }

    private static GroupResponse Map(Group group)
    {
        return new GroupResponse
        {
            Id = group.Id,
            Title = group.Title,
            Course = group.Course,
            Faculty = group.Faculty,
            StudentCount = group.Users.Count
        };
    }
}
