using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.ActivityFeed;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class TeamService : ITeamService
{
    private const string InviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private readonly AppDbContext _dbContext;
    private readonly IKrkCalculationService _krkCalculationService;
    private readonly IActivityFeedService _activityFeed;

    public TeamService(
        AppDbContext dbContext,
        IKrkCalculationService krkCalculationService,
        IActivityFeedService activityFeed)
    {
        _dbContext = dbContext;
        _krkCalculationService = krkCalculationService;
        _activityFeed = activityFeed;
    }

    public async Task<IReadOnlyCollection<TeamResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Captain)
            .Include(team => team.Members)
            .OrderByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .ToListAsync(cancellationToken);

        return teams.Select(MapTeamResponse).ToList();
    }

    public async Task<IReadOnlyCollection<TeamResponse>> SearchAsync(string? query, int limit, CancellationToken cancellationToken = default)
    {
        var safeLimit = Math.Clamp(limit, 1, 50);
        var normalizedQuery = query?.Trim();

        IQueryable<Team> teams = _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Captain)
            .Include(team => team.Members);

        if (!string.IsNullOrWhiteSpace(normalizedQuery))
        {
            var pattern = $"%{normalizedQuery}%";
            teams = teams.Where(team =>
                EF.Functions.ILike(team.Name, pattern) ||
                EF.Functions.ILike(team.Description, pattern) ||
                EF.Functions.ILike(team.InviteCode, pattern));
        }

        var result = await teams
            .OrderByDescending(team => team.KrkCached)
            .ThenByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .Take(safeLimit)
            .ToListAsync(cancellationToken);

        return result.Select(MapTeamResponse).ToList();
    }

    public async Task<TeamResponse?> GetByIdAsync(int teamId, CancellationToken cancellationToken = default)
    {
        var team = await _dbContext.Teams
            .AsNoTracking()
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.Id == teamId, cancellationToken);

        return team is null ? null : MapTeamResponse(team);
    }

    public async Task<TeamResponse?> GetByInviteCodeAsync(string inviteCode, CancellationToken cancellationToken = default)
    {
        var normalizedInviteCode = NormalizeInviteCode(inviteCode);
        if (string.IsNullOrWhiteSpace(normalizedInviteCode))
        {
            return null;
        }

        var team = await _dbContext.Teams
            .AsNoTracking()
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.InviteCode == normalizedInviteCode, cancellationToken);

        return team is null ? null : MapTeamResponse(team);
    }

    public async Task<TeamResponse?> GetForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var teamId = await GetTeamIdForUserAsync(userId, cancellationToken);
        return teamId is null ? null : await GetByIdAsync(teamId.Value, cancellationToken);
    }

    public async Task<IReadOnlyCollection<ActivityFeedItemResponse>> GetActivityForUserTeamAsync(int userId, int limit, CancellationToken cancellationToken = default)
    {
        var teamId = await GetTeamIdForUserAsync(userId, cancellationToken);
        if (teamId is null)
        {
            return Array.Empty<ActivityFeedItemResponse>();
        }

        var safeLimit = Math.Clamp(limit, 1, 100);
        var items = await _dbContext.ActivityFeedItems
            .AsNoTracking()
            .Include(item => item.Team)
            .Include(item => item.User)
            .Where(item => item.TeamId == teamId)
            .OrderByDescending(item => item.CreatedAtUtc)
            .Take(safeLimit)
            .ToListAsync(cancellationToken);

        return items.Select(MapActivityItemResponse).ToList();
    }

    public Task<int?> GetTeamIdForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.TeamId)
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<CreateTeamResult> CreateAsync(int userId, CreateTeamDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new CreateTeamResult { Type = CreateTeamResultType.UserNotFound };
        }

        if (user.TeamId is not null)
        {
            return new CreateTeamResult { Type = CreateTeamResultType.AlreadyInTeam };
        }

        var team = new Team
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            InviteCode = await GenerateInviteCodeAsync(cancellationToken),
            CaptainId = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        user.Team = team;
        user.Role = Roles.Captain;

        await CancelPendingJoinRequestsForUserAsync(user.Id, cancellationToken);

        _dbContext.Teams.Add(team);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.TeamCreated,
            $"Создана команда «{team.Name}».",
            team.Id,
            user.Id,
            cancellationToken);

        await _krkCalculationService.RecalculateForTeamAsync(team.Id, cancellationToken);

        return new CreateTeamResult
        {
            Type = CreateTeamResultType.Created,
            Team = await GetByIdAsync(team.Id, cancellationToken)
        };
    }

    public async Task<JoinTeamResult> JoinAsync(int userId, JoinTeamRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new JoinTeamResult { Type = JoinTeamResultType.UserNotFound };
        }

        if (user.TeamId is not null)
        {
            return new JoinTeamResult { Type = JoinTeamResultType.AlreadyInTeam };
        }

        var inviteCode = NormalizeInviteCode(request.InviteCode);
        var team = await _dbContext.Teams.SingleOrDefaultAsync(existingTeam => existingTeam.InviteCode == inviteCode, cancellationToken);
        if (team is null)
        {
            return new JoinTeamResult { Type = JoinTeamResultType.TeamNotFound };
        }

        user.TeamId = team.Id;
        user.Role = Roles.Student;
        await CancelPendingJoinRequestsForUserAsync(user.Id, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.TeamJoined,
            $"{user.UserName} вступил(а) в команду «{team.Name}».",
            team.Id,
            user.Id,
            cancellationToken);

        return new JoinTeamResult
        {
            Type = JoinTeamResultType.Joined,
            Team = await GetByIdAsync(team.Id, cancellationToken)
        };
    }

    public async Task<IReadOnlyCollection<TeamJoinRequestResponse>> GetJoinRequestsAsync(int userId, string? scope, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return Array.Empty<TeamJoinRequestResponse>();
        }

        var normalizedScope = (scope ?? string.Empty).Trim().ToLowerInvariant();
        IQueryable<TeamJoinRequest> query = _dbContext.TeamJoinRequests
            .AsNoTracking()
            .Include(request => request.Team)
            .Include(request => request.User)
            .Include(request => request.DecidedByUser);

        var isAdmin = user.Role == Roles.Admin;
        var captainTeamId = user.Role == Roles.Captain ? user.TeamId : null;

        query = normalizedScope switch
        {
            "incoming" when captainTeamId is not null =>
                query.Where(request => request.TeamId == captainTeamId.Value),
            "outgoing" =>
                query.Where(request => request.UserId == userId),
            "all" when isAdmin => query,
            _ when captainTeamId is not null =>
                query.Where(request => request.TeamId == captainTeamId.Value || request.UserId == userId),
            _ when isAdmin => query,
            _ => query.Where(request => request.UserId == userId)
        };

        var requests = await query
            .OrderByDescending(request => request.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return requests.Select(MapJoinRequestResponse).ToList();
    }

    public async Task<TeamJoinRequestResult> CreateJoinRequestAsync(int userId, CreateTeamJoinRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.UserNotFound };
        }

        if (user.TeamId is not null)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.AlreadyInTeam };
        }

        var team = await _dbContext.Teams.SingleOrDefaultAsync(existingTeam => existingTeam.Id == request.TeamId, cancellationToken);
        if (team is null)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.TeamNotFound };
        }

        var hasPending = await _dbContext.TeamJoinRequests.AnyAsync(existingRequest =>
            existingRequest.TeamId == request.TeamId &&
            existingRequest.UserId == userId &&
            existingRequest.Status == TeamJoinRequestStatuses.Pending,
            cancellationToken);
        if (hasPending)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.AlreadyPending };
        }

        var joinRequest = new TeamJoinRequest
        {
            TeamId = request.TeamId,
            UserId = userId,
            Message = request.Message.Trim(),
            Status = TeamJoinRequestStatuses.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.TeamJoinRequests.Add(joinRequest);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.TeamJoinRequestCreated,
            $"{DisplayNameFormatter.Format(user)} подал(а) заявку в команду \"{team.Name}\".",
            team.Id,
            user.Id,
            cancellationToken);

        return new TeamJoinRequestResult
        {
            Type = TeamJoinRequestResultType.Created,
            Request = await BuildJoinRequestAsync(joinRequest.Id, cancellationToken)
        };
    }

    public async Task<TeamJoinRequestResult> UpdateJoinRequestStatusAsync(
        int userId,
        int requestId,
        UpdateTeamJoinRequestStatusDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.UserNotFound };
        }

        var joinRequest = await _dbContext.TeamJoinRequests
            .Include(existingRequest => existingRequest.Team)
            .Include(existingRequest => existingRequest.User)
            .Include(existingRequest => existingRequest.DecidedByUser)
            .SingleOrDefaultAsync(existingRequest => existingRequest.Id == requestId, cancellationToken);
        if (joinRequest is null)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.RequestNotFound };
        }

        var canonicalStatus = ResolveJoinRequestStatus(request.Status);
        if (canonicalStatus is null)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.InvalidStatus };
        }

        var isAdmin = user.Role == Roles.Admin;
        var isCaptainOfTargetTeam = user.Role == Roles.Captain && user.TeamId == joinRequest.TeamId;
        var isApplicant = joinRequest.UserId == userId;
        var isCancellation = canonicalStatus == TeamJoinRequestStatuses.Cancelled;
        if (isCancellation)
        {
            if (!isApplicant && !isAdmin)
            {
                return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.Forbidden };
            }
        }
        else if (!isAdmin && !isCaptainOfTargetTeam)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.Forbidden };
        }

        if (joinRequest.Status != TeamJoinRequestStatuses.Pending)
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.InvalidStatus };
        }

        if (canonicalStatus == TeamJoinRequestStatuses.Accepted)
        {
            var applicant = joinRequest.User ?? await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == joinRequest.UserId, cancellationToken);
            if (applicant is null)
            {
                return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.UserNotFound };
            }

            if (applicant.TeamId is not null)
            {
                return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.ApplicantAlreadyInTeam };
            }

            applicant.TeamId = joinRequest.TeamId;
            applicant.Role = Roles.Student;
            await CancelPendingJoinRequestsForUserAsync(applicant.Id, cancellationToken, joinRequest.Id);
        }

        joinRequest.Status = canonicalStatus;
        joinRequest.DecidedAtUtc = DateTime.UtcNow;
        joinRequest.DecidedByUserId = user.Id;
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (canonicalStatus == TeamJoinRequestStatuses.Accepted)
        {
            await _activityFeed.AppendAsync(
                ActivityFeedItemTypes.TeamJoinRequestAccepted,
                $"{FormatUser(joinRequest.User)} принят(а) в команду \"{joinRequest.Team?.Name ?? string.Empty}\".",
                joinRequest.TeamId,
                joinRequest.UserId,
                cancellationToken);
        }
        else if (canonicalStatus == TeamJoinRequestStatuses.Rejected)
        {
            await _activityFeed.AppendAsync(
                ActivityFeedItemTypes.TeamJoinRequestRejected,
                $"Заявка в команду \"{joinRequest.Team?.Name ?? string.Empty}\" отклонена.",
                joinRequest.TeamId,
                joinRequest.UserId,
                cancellationToken);
        }

        return new TeamJoinRequestResult
        {
            Type = TeamJoinRequestResultType.Updated,
            Request = await BuildJoinRequestAsync(joinRequest.Id, cancellationToken),
            Team = canonicalStatus == TeamJoinRequestStatuses.Accepted
                ? await GetByIdAsync(joinRequest.TeamId, cancellationToken)
                : null
        };
    }

    public async Task<DisbandTeamResult> DisbandAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new DisbandTeamResult { Type = DisbandTeamResultType.UserNotFound };
        }

        if (user.TeamId is null)
        {
            return new DisbandTeamResult { Type = DisbandTeamResultType.NotInTeam };
        }

        var team = await _dbContext.Teams
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.Id == user.TeamId, cancellationToken);
        if (team is null)
        {
            user.TeamId = null;
            if (user.Role == Roles.Captain)
            {
                user.Role = Roles.Student;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            return new DisbandTeamResult { Type = DisbandTeamResultType.NotInTeam };
        }

        if (team.CaptainId != userId)
        {
            return new DisbandTeamResult { Type = DisbandTeamResultType.NotCaptain };
        }

        var relatedHelpRequests = await _dbContext.HelpRequests
            .Where(request => request.FromTeamId == team.Id || request.ToTeamId == team.Id)
            .ToListAsync(cancellationToken);
        if (relatedHelpRequests.Count > 0)
        {
            _dbContext.HelpRequests.RemoveRange(relatedHelpRequests);
        }

        foreach (var member in team.Members.ToList())
        {
            member.TeamId = null;
            if (member.Role == Roles.Captain)
            {
                member.Role = Roles.Student;
            }
        }

        team.CaptainId = null;
        _dbContext.Teams.Remove(team);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new DisbandTeamResult { Type = DisbandTeamResultType.Disbanded };
    }

    public async Task<TeamResponse?> UpdateScoreAsync(int teamId, UpdateTeamScoreRequest request, CancellationToken cancellationToken = default)
    {
        var team = await _dbContext.Teams
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.Id == teamId, cancellationToken);

        if (team is null)
        {
            return null;
        }

        team.Score = request.Score;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _krkCalculationService.RecalculateForTeamAsync(team.Id, cancellationToken);

        var refreshed = await _dbContext.Teams
            .AsNoTracking()
            .Include(existing => existing.Captain)
            .Include(existing => existing.Members)
            .SingleAsync(existing => existing.Id == teamId, cancellationToken);

        return MapTeamResponse(refreshed);
    }

    private async Task<string> GenerateInviteCodeAsync(CancellationToken cancellationToken)
    {
        while (true)
        {
            var buffer = new char[6];
            for (var i = 0; i < buffer.Length; i++)
            {
                buffer[i] = InviteAlphabet[Random.Shared.Next(InviteAlphabet.Length)];
            }

            var inviteCode = new string(buffer);
            var exists = await _dbContext.Teams.AnyAsync(team => team.InviteCode == inviteCode, cancellationToken);
            if (!exists)
            {
                return inviteCode;
            }
        }
    }

    private async Task CancelPendingJoinRequestsForUserAsync(int userId, CancellationToken cancellationToken, int? exceptRequestId = null)
    {
        var pendingRequests = await _dbContext.TeamJoinRequests
            .Where(request =>
                request.UserId == userId &&
                request.Status == TeamJoinRequestStatuses.Pending &&
                (exceptRequestId == null || request.Id != exceptRequestId.Value))
            .ToListAsync(cancellationToken);

        foreach (var pendingRequest in pendingRequests)
        {
            pendingRequest.Status = TeamJoinRequestStatuses.Cancelled;
            pendingRequest.DecidedAtUtc = DateTime.UtcNow;
        }
    }

    private async Task<TeamJoinRequestResponse> BuildJoinRequestAsync(int requestId, CancellationToken cancellationToken)
    {
        var joinRequest = await _dbContext.TeamJoinRequests
            .AsNoTracking()
            .Include(request => request.Team)
            .Include(request => request.User)
            .Include(request => request.DecidedByUser)
            .SingleAsync(request => request.Id == requestId, cancellationToken);

        return MapJoinRequestResponse(joinRequest);
    }

    private static string NormalizeInviteCode(string inviteCode) =>
        inviteCode.Trim().ToUpperInvariant();

    private static string? ResolveJoinRequestStatus(string status)
    {
        var normalized = status.Trim();
        if (normalized.Equals(TeamJoinRequestStatuses.Accepted, StringComparison.OrdinalIgnoreCase))
        {
            return TeamJoinRequestStatuses.Accepted;
        }

        if (normalized.Equals(TeamJoinRequestStatuses.Rejected, StringComparison.OrdinalIgnoreCase))
        {
            return TeamJoinRequestStatuses.Rejected;
        }

        if (normalized.Equals(TeamJoinRequestStatuses.Cancelled, StringComparison.OrdinalIgnoreCase))
        {
            return TeamJoinRequestStatuses.Cancelled;
        }

        return null;
    }

    private static ActivityFeedItemResponse MapActivityItemResponse(ActivityFeedItem item) => new()
    {
        Id = item.Id,
        Type = item.Type,
        Message = item.Message,
        TeamId = item.TeamId,
        TeamName = item.Team?.Name ?? string.Empty,
        UserId = item.UserId,
        UserName = item.User?.UserName ?? string.Empty,
        CreatedAtUtc = item.CreatedAtUtc
    };

    private static TeamJoinRequestResponse MapJoinRequestResponse(TeamJoinRequest request)
    {
        return new TeamJoinRequestResponse
        {
            Id = request.Id,
            TeamId = request.TeamId,
            TeamName = request.Team?.Name ?? string.Empty,
            UserId = request.UserId,
            UserName = request.User?.UserName ?? string.Empty,
            DisplayName = FormatUser(request.User),
            AvatarUrl = request.User?.AvatarUrl ?? string.Empty,
            Message = request.Message,
            Status = request.Status,
            CreatedAtUtc = request.CreatedAtUtc,
            DecidedAtUtc = request.DecidedAtUtc,
            DecidedByUserId = request.DecidedByUserId,
            DecidedByUserName = request.DecidedByUser?.UserName ?? string.Empty
        };
    }

    private static TeamResponse MapTeamResponse(Team team)
    {
        return new TeamResponse
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            InviteCode = team.InviteCode,
            CaptainId = team.CaptainId,
            Score = team.Score,
            Krk = Math.Round(team.KrkCached, 1),
            CaptainUserName = team.Captain?.UserName ?? string.Empty,
            CreatedAt = team.CreatedAt,
            MemberCount = team.Members.Count,
            Members = team.Members
                .OrderByDescending(member => team.CaptainId == member.Id)
                .ThenBy(member => member.UserName)
                .Select(member => new TeamMemberResponse
                {
                    Id = member.Id,
                    UserName = member.UserName,
                    Email = member.Email,
                    Role = member.Role,
                    IsCaptain = team.CaptainId == member.Id,
                    DisplayName = DisplayNameFormatter.Format(member),
                    RoleLabel = team.CaptainId == member.Id ? "КАПИТАН" : "УЧАСТНИК",
                    AvatarUrl = member.AvatarUrl,
                    UserPoints = member.UserPoints
                })
                .ToList()
        };
    }

    private static string FormatUser(User? user) =>
        user is null ? string.Empty : DisplayNameFormatter.Format(user);
}
