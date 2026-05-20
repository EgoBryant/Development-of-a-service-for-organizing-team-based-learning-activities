using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.HelpRequests;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class HelpRequestsService : IHelpRequestsService
{
    private static readonly string[] AllowedStatuses =
    [
        HelpRequestStatuses.Open,
        HelpRequestStatuses.Accepted,
        HelpRequestStatuses.Rejected,
        HelpRequestStatuses.Completed
    ];

    private readonly AppDbContext _dbContext;
    private readonly IKrkCalculationService _krkCalculationService;
    private readonly IActivityFeedService _activityFeed;
    private readonly IAchievementsService _achievements;

    public HelpRequestsService(
        AppDbContext dbContext,
        IKrkCalculationService krkCalculationService,
        IActivityFeedService activityFeed,
        IAchievementsService achievements)
    {
        _dbContext = dbContext;
        _krkCalculationService = krkCalculationService;
        _activityFeed = activityFeed;
        _achievements = achievements;
    }

    public async Task<IReadOnlyCollection<HelpRequestResponse>> GetAsync(int userId, bool isAdmin, string? scope, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.AsNoTracking()
            .SingleOrDefaultAsync(existing => existing.Id == userId, cancellationToken);
        var teamId = user?.TeamId;

        IQueryable<HelpRequest> query = _dbContext.HelpRequests
            .AsNoTracking()
            .Include(request => request.FromTeam)
            .Include(request => request.ToTeam);

        var normalizedScope = (scope ?? string.Empty).Trim().ToLowerInvariant();

        query = normalizedScope switch
        {
            "incoming" when teamId is not null =>
                query.Where(request => request.ToTeamId == teamId),
            "outgoing" when teamId is not null =>
                query.Where(request => request.FromTeamId == teamId),
            "all" when isAdmin => query,
            _ when teamId is not null =>
                query.Where(request => request.ToTeamId == teamId || request.FromTeamId == teamId),
            _ when isAdmin => query,
            _ => query.Where(request => false)
        };

        var requests = await query
            .OrderByDescending(request => request.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return requests.Select(Map).ToList();
    }

    public async Task<HelpRequestCreateResult> CreateAsync(int userId, CreateHelpRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new HelpRequestCreateResult { Type = HelpRequestCreateResultType.UserNotFound };
        }

        if (user.TeamId is null)
        {
            return new HelpRequestCreateResult { Type = HelpRequestCreateResultType.UserHasNoTeam };
        }

        if (user.TeamId.Value == request.ToTeamId)
        {
            return new HelpRequestCreateResult { Type = HelpRequestCreateResultType.SameTeam };
        }

        var targetTeamExists = await _dbContext.Teams.AnyAsync(team => team.Id == request.ToTeamId, cancellationToken);
        if (!targetTeamExists)
        {
            return new HelpRequestCreateResult { Type = HelpRequestCreateResultType.TargetTeamNotFound };
        }

        var helpRequest = new HelpRequest
        {
            FromTeamId = user.TeamId.Value,
            ToTeamId = request.ToTeamId,
            Topic = request.Topic.Trim(),
            Tag = request.Tag.Trim(),
            Description = request.Description.Trim(),
            Format = request.Format.Trim(),
            ScheduledAtUtc = request.ScheduledAtUtc is null
                ? null
                : DateTime.SpecifyKind(request.ScheduledAtUtc.Value, DateTimeKind.Utc),
            LeagueLabel = request.LeagueLabel.Trim(),
            BonusPoints = request.BonusPoints,
            Status = HelpRequestStatuses.Open,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.HelpRequests.Add(helpRequest);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.HelpRequestCreated,
            $"Команда отправила запрос «спасения»: «{helpRequest.Topic}».",
            user.TeamId,
            user.Id,
            cancellationToken);

        return new HelpRequestCreateResult
        {
            Type = HelpRequestCreateResultType.Created,
            HelpRequest = await BuildAsync(helpRequest.Id, cancellationToken)
        };
    }

    public async Task<HelpRequestStatusUpdateResult> UpdateStatusAsync(int userId, int helpRequestId, UpdateHelpRequestStatusDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new HelpRequestStatusUpdateResult { Type = HelpRequestStatusUpdateResultType.UserNotFound };
        }

        var helpRequest = await _dbContext.HelpRequests
            .Include(existing => existing.FromTeam)
            .Include(existing => existing.ToTeam)
            .SingleOrDefaultAsync(existingRequest => existingRequest.Id == helpRequestId, cancellationToken);
        if (helpRequest is null)
        {
            return new HelpRequestStatusUpdateResult { Type = HelpRequestStatusUpdateResultType.HelpRequestNotFound };
        }

        var normalizedStatus = request.Status.Trim();
        if (!AllowedStatuses.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return new HelpRequestStatusUpdateResult { Type = HelpRequestStatusUpdateResultType.InvalidStatus };
        }

        var isAdmin = user.Role == Roles.Admin;
        var isCaptainOfTargetTeam = user.Role == Roles.Captain && user.TeamId == helpRequest.ToTeamId;
        if (!isAdmin && !isCaptainOfTargetTeam)
        {
            return new HelpRequestStatusUpdateResult { Type = HelpRequestStatusUpdateResultType.Forbidden };
        }

        var canonicalStatus = AllowedStatuses.Single(status => status.Equals(normalizedStatus, StringComparison.OrdinalIgnoreCase));

        var becameCompleted = canonicalStatus == HelpRequestStatuses.Completed && helpRequest.Status != HelpRequestStatuses.Completed;
        helpRequest.Status = canonicalStatus;

        var helpingTeamId = helpRequest.ToTeamId;
        var helpedTeamId = helpRequest.FromTeamId;

        if (becameCompleted && !helpRequest.BonusAwarded && helpRequest.BonusPoints > 0)
        {
            var helpingTeam = helpRequest.ToTeam ?? await _dbContext.Teams.SingleOrDefaultAsync(team => team.Id == helpingTeamId, cancellationToken);
            if (helpingTeam is not null)
            {
                helpingTeam.Score += (int)Math.Round(helpRequest.BonusPoints, MidpointRounding.AwayFromZero);
                helpRequest.BonusAwarded = true;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        if (becameCompleted)
        {
            await _krkCalculationService.RecalculateForTeamAsync(helpingTeamId, cancellationToken);
            await _krkCalculationService.RecalculateForTeamAsync(helpedTeamId, cancellationToken);

            await _activityFeed.AppendAsync(
                ActivityFeedItemTypes.HelpRequestCompleted,
                $"«Спасение» завершено: «{helpRequest.Topic}».",
                helpingTeamId,
                null,
                cancellationToken);

            var helpingCaptainId = await _dbContext.Teams.AsNoTracking()
                .Where(team => team.Id == helpingTeamId)
                .Select(team => (int?)team.CaptainId)
                .SingleOrDefaultAsync(cancellationToken);
            if (helpingCaptainId is not null)
            {
                await _achievements.GrantIfMissingAsync(helpingCaptainId.Value, AchievementCodes.FirstRescue, cancellationToken);
            }
        }

        return new HelpRequestStatusUpdateResult
        {
            Type = HelpRequestStatusUpdateResultType.Updated,
            HelpRequest = await BuildAsync(helpRequest.Id, cancellationToken)
        };
    }

    private async Task<HelpRequestResponse> BuildAsync(int helpRequestId, CancellationToken cancellationToken)
    {
        return await _dbContext.HelpRequests
            .AsNoTracking()
            .Include(request => request.FromTeam)
            .Include(request => request.ToTeam)
            .Where(request => request.Id == helpRequestId)
            .Select(request => Map(request))
            .SingleAsync(cancellationToken);
    }

    private static HelpRequestResponse Map(HelpRequest request)
    {
        return new HelpRequestResponse
        {
            Id = request.Id,
            FromTeamId = request.FromTeamId,
            FromTeamName = request.FromTeam?.Name ?? string.Empty,
            ToTeamId = request.ToTeamId,
            ToTeamName = request.ToTeam?.Name ?? string.Empty,
            Topic = request.Topic,
            Tag = request.Tag,
            Description = request.Description,
            Format = request.Format,
            ScheduledAtUtc = request.ScheduledAtUtc,
            LeagueLabel = request.LeagueLabel,
            Status = request.Status,
            BonusPoints = request.BonusPoints,
            BonusAwarded = request.BonusAwarded,
            CreatedAtUtc = request.CreatedAtUtc
        };
    }
}
