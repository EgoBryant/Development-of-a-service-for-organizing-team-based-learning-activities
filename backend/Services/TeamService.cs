using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class TeamService : ITeamService
{
    private const string InviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private readonly AppDbContext _dbContext;

    public TeamService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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

        return MapTeamResponse(team);
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
            CaptainUserName = team.Captain?.UserName ?? string.Empty,
            CreatedAt = team.CreatedAt,
            MemberCount = team.Members.Count,
            Members = team.Members
                .OrderBy(member => member.UserName)
                .Select(member => new TeamMemberResponse
                {
                    Id = member.Id,
                    UserName = member.UserName,
                    Email = member.Email,
                    Role = member.Role,
                    IsCaptain = team.CaptainId == member.Id
                })
                .ToList()
        };
    }
}
