using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.CheckIns;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Еженедельные check-in отчёты команд.
/// </summary>
public class CheckInsService : ICheckInsService
{
    private readonly AppDbContext _dbContext;
    private readonly IActivityFeedService _activityFeed;
    private readonly IAchievementsService _achievements;

    /// <summary>
    /// Создаёт сервис check-in.
    /// </summary>
    public CheckInsService(
        AppDbContext dbContext,
        IActivityFeedService activityFeed,
        IAchievementsService achievements)
    {
        _dbContext = dbContext;
        _activityFeed = activityFeed;
        _achievements = achievements;
    }

    /// <summary>
    /// Возвращает check-in текущей команды пользователя, от новых к старым.
    /// </summary>
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

    /// <summary>
    /// Создаёт check-in за указанную неделю; дубликаты по номеру недели запрещены.
    /// </summary>
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
            Status = CheckInStatuses.Submitted,
            SubmittedAtUtc = DateTime.UtcNow,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.CheckIns.Add(checkIn);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.CheckIn,
            $"Капитан сдал(а) check-in за {request.WeekNumber} неделю.",
            user.TeamId,
            user.Id,
            cancellationToken);

        await _achievements.GrantIfMissingAsync(user.Id, AchievementCodes.FirstCheckIn, cancellationToken);

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

    /// <summary>
    /// Преобразует сущность check-in в DTO ответа.
    /// </summary>
    private static CheckInResponse Map(CheckIn checkIn)
    {
        return new CheckInResponse
        {
            Id = checkIn.Id,
            TeamId = checkIn.TeamId,
            TeamName = checkIn.Team?.Name ?? string.Empty,
            WeekNumber = checkIn.WeekNumber,
            ReportText = checkIn.ReportText,
            Status = string.IsNullOrWhiteSpace(checkIn.Status) ? CheckInStatuses.Submitted : checkIn.Status,
            SubmittedAtUtc = checkIn.SubmittedAtUtc,
            CreatedAtUtc = checkIn.CreatedAtUtc
        };
    }
}
