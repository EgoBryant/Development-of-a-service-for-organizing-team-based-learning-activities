using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public TeamsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamResponse>>> GetAll()
    {
        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Captain)
            .Include(team => team.Members)
            .OrderByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .ToListAsync();

        return Ok(teams.Select(MapTeamResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TeamResponse>> GetById(int id)
    {
        var team = await _dbContext.Teams
            .AsNoTracking()
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.Id == id);

        if (team is null)
        {
            return NotFound();
        }

        return Ok(MapTeamResponse(team));
    }

    [HttpPost]
    public async Task<ActionResult<TeamResponse>> Create(CreateTeamRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser is null)
        {
            return Unauthorized();
        }

        if (currentUser.TeamId is not null)
        {
            return Conflict(new { message = "User already belongs to a team." });
        }

        var inviteCode = await GenerateUniqueInviteCodeAsync();
        var team = new Team
        {
            Name = request.Name.Trim(),
            InviteCode = inviteCode,
            Score = 0,
            CaptainUserId = currentUser.Id
        };

        currentUser.Team = team;
        _dbContext.Teams.Add(team);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = team.Id }, await BuildTeamResponseAsync(team.Id));
    }

    [HttpPost("join")]
    public async Task<ActionResult<TeamResponse>> Join(JoinTeamRequest request)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser is null)
        {
            return Unauthorized();
        }

        if (currentUser.TeamId is not null)
        {
            return Conflict(new { message = "User already belongs to a team." });
        }

        var inviteCode = request.InviteCode.Trim().ToUpperInvariant();
        var team = await _dbContext.Teams.SingleOrDefaultAsync(existingTeam => existingTeam.InviteCode == inviteCode);
        if (team is null)
        {
            return NotFound(new { message = "Team with this invite code was not found." });
        }

        currentUser.TeamId = team.Id;
        await _dbContext.SaveChangesAsync();

        return Ok(await BuildTeamResponseAsync(team.Id));
    }

    [HttpGet("me")]
    public async Task<ActionResult<TeamResponse>> Me()
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser is null)
        {
            return Unauthorized();
        }

        if (currentUser.TeamId is null)
        {
            return NotFound(new { message = "User is not in a team." });
        }

        return Ok(await BuildTeamResponseAsync(currentUser.TeamId.Value));
    }

    [HttpPatch("{id:int}/score")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<TeamResponse>> UpdateScore(int id, UpdateTeamScoreRequest request)
    {
        var team = await _dbContext.Teams
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.Id == id);

        if (team is null)
        {
            return NotFound();
        }

        team.Score = request.Score;
        await _dbContext.SaveChangesAsync();

        return Ok(MapTeamResponse(team));
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return null;
        }

        return await _dbContext.Users.SingleOrDefaultAsync(user => user.Id == userId.Value);
    }

    private async Task<string> GenerateUniqueInviteCodeAsync()
    {
        const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        while (true)
        {
            var buffer = new char[6];
            for (var i = 0; i < buffer.Length; i++)
            {
                buffer[i] = alphabet[Random.Shared.Next(alphabet.Length)];
            }

            var code = new string(buffer);
            var exists = await _dbContext.Teams.AnyAsync(team => team.InviteCode == code);
            if (!exists)
            {
                return code;
            }
        }
    }

    private async Task<TeamResponse> BuildTeamResponseAsync(int teamId)
    {
        var team = await _dbContext.Teams
            .AsNoTracking()
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleAsync(existingTeam => existingTeam.Id == teamId);

        return MapTeamResponse(team);
    }

    private static TeamResponse MapTeamResponse(Team team)
    {
        return new TeamResponse
        {
            Id = team.Id,
            Name = team.Name,
            InviteCode = team.InviteCode,
            Score = team.Score,
            CaptainUserName = team.Captain?.UserName ?? string.Empty,
            MemberCount = team.Members.Count,
            Members = team.Members
                .OrderBy(member => member.UserName)
                .Select(member => new TeamMemberResponse
                {
                    Id = member.Id,
                    UserName = member.UserName,
                    Email = member.Email,
                    Role = member.Role,
                    IsCaptain = team.CaptainUserId == member.Id
                })
                .ToList()
        };
    }

    private int? GetCurrentUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(id, out var parsedId) ? parsedId : null;
    }
}
