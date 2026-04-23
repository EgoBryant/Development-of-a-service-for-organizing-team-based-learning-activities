using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.CheckIns;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class CheckInsService : ICheckInsService
{
    private readonly AppDbContext _dbContext;

    public CheckInsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<CheckInResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user?.TeamId is null)
        {
            return Array.Empty<CheckInResponse>();
        }

        var checkIns = await _dbContext.CheckIns
            .AsNoTracking()
            .Include(checkIn => checkIn.Team)
            .Where(checkIn => checkIn.TeamId == user.TeamId.Value)
            .OrderByDescending(checkIn => checkIn.WeekNumber)
            .ToListAsync(cancellationToken);

        return checkIns.Select(Map).ToList();
    }

    public async Task<CheckInCreateResult> CreateAsync(int userId, CreateCheckInDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new CheckInCreateResult { Type = CheckInCreateResultType.UserNotFound };
        }

        if (user.TeamId is null)
        {
            return new CheckInCreateResult { Type = CheckInCreateResultType.UserHasNoTeam };
        }

        var duplicateWeek = await _dbContext.CheckIns.AnyAsync(checkIn =>
            checkIn.TeamId == user.TeamId.Value && checkIn.WeekNumber == request.WeekNumber, cancellationToken);
        if (duplicateWeek)
        {
            return new CheckInCreateResult { Type = CheckInCreateResultType.DuplicateWeek };
        }

        var checkIn = new CheckIn
        {
            TeamId = user.TeamId.Value,
            WeekNumber = request.WeekNumber,
            ReportText = request.ReportText.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.CheckIns.Add(checkIn);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CheckInCreateResult
        {
            Type = CheckInCreateResultType.Created,
            CheckIn = await _dbContext.CheckIns
                .AsNoTracking()
                .Include(existingCheckIn => existingCheckIn.Team)
                .Where(existingCheckIn => existingCheckIn.Id == checkIn.Id)
                .Select(existingCheckIn => Map(existingCheckIn))
                .SingleAsync(cancellationToken)
        };
    }

    private static CheckInResponse Map(CheckIn checkIn)
    {
        return new CheckInResponse
        {
            Id = checkIn.Id,
            TeamId = checkIn.TeamId,
            TeamName = checkIn.Team?.Name ?? string.Empty,
            WeekNumber = checkIn.WeekNumber,
            ReportText = checkIn.ReportText,
            CreatedAtUtc = checkIn.CreatedAtUtc
        };
    }
}
