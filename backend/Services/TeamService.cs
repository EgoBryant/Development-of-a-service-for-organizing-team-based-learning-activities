using Microsoft.EntityFrameworkCore;
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

    public async Task<TeamResponse?> GetByIdAsync(int teamId, CancellationToken cancellationToken = default)
    {
        var team = await _dbContext.Teams
            .AsNoTracking()
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.Id == teamId, cancellationToken);

        return team is null ? null : MapTeamResponse(team);
    }

    public async Task<TeamResponse?> GetForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user?.TeamId is null)
        {
            return null;
        }

        return await GetByIdAsync(user.TeamId.Value, cancellationToken);
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

        var inviteCode = request.InviteCode.Trim().ToUpperInvariant();
        var team = await _dbContext.Teams.SingleOrDefaultAsync(existingTeam => existingTeam.InviteCode == inviteCode, cancellationToken);
        if (team is null)
        {
            return new JoinTeamResult { Type = JoinTeamResultType.TeamNotFound };
        }

        user.TeamId = team.Id;
        user.Role = Roles.Student;
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

    internal static TeamResponse MapTeamResponse(Team team)
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
                    DisplayName = BuildDisplayName(member),
                    RoleLabel = team.CaptainId == member.Id ? "КАПИТАН" : "УЧАСТНИК",
                    AvatarUrl = member.AvatarUrl,
                    UserPoints = member.UserPoints
                })
                .ToList()
        };
    }

    private static string BuildDisplayName(User member)
    {
        var lname = (member.LastName ?? string.Empty).Trim();
        var fname = (member.FirstName ?? string.Empty).Trim();
        if (lname.Length > 0 || fname.Length > 0)
        {
            var fnameInitial = fname.Length > 0 ? $" {fname[..1].ToUpperInvariant()}." : string.Empty;
            var baseName = (lname + fnameInitial).Trim();
            if (baseName.Length > 0)
            {
                return baseName.ToUpperInvariant();
            }
        }
        if (!string.IsNullOrWhiteSpace(member.Nickname))
        {
            return member.Nickname.Trim().ToUpperInvariant();
        }
        return (member.UserName ?? string.Empty).Trim().ToUpperInvariant();
    }
}
