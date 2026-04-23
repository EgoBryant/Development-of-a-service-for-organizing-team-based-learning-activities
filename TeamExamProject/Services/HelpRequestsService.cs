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

    public HelpRequestsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<HelpRequestResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var requests = await _dbContext.HelpRequests
            .AsNoTracking()
            .Include(request => request.FromTeam)
            .Include(request => request.ToTeam)
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
            Description = request.Description.Trim(),
            BonusPoints = request.BonusPoints,
            Status = HelpRequestStatuses.Open,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.HelpRequests.Add(helpRequest);
        await _dbContext.SaveChangesAsync(cancellationToken);

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

        var helpRequest = await _dbContext.HelpRequests.SingleOrDefaultAsync(existingRequest => existingRequest.Id == helpRequestId, cancellationToken);
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

        helpRequest.Status = AllowedStatuses.Single(status => status.Equals(normalizedStatus, StringComparison.OrdinalIgnoreCase));
        await _dbContext.SaveChangesAsync(cancellationToken);

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
            Description = request.Description,
            Status = request.Status,
            BonusPoints = request.BonusPoints,
            CreatedAtUtc = request.CreatedAtUtc
        };
    }
}
