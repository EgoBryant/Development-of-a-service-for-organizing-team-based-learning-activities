using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Ratings;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class RatingsService : IRatingsService
{
    private readonly AppDbContext _dbContext;

    public RatingsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<RatingTeamResponse>> GetTeamsAsync(RatingQuery query, CancellationToken cancellationToken = default)
    {
        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Members)
            .Include(team => team.Captain)
            .ToListAsync(cancellationToken);

        // Базовый порядок по очкам — для расчёта rank.
        var ranked = teams
            .OrderByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .Select((team, index) => MapTeam(team, index + 1))
            .ToList();

        var filtered = FilterTeams(ranked, query.Search);
        var sorted = SortTeams(filtered, query.Sort);

        if (query.Limit is > 0)
        {
            sorted = sorted.Take(query.Limit.Value).ToList();
        }

        return sorted;
    }

    public async Task<RatingTeamResponse?> GetTeamByIdAsync(int teamId, CancellationToken cancellationToken = default)
    {
        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Members)
            .Include(team => team.Captain)
            .OrderByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .ToListAsync(cancellationToken);

        var index = teams.FindIndex(team => team.Id == teamId);
        if (index < 0)
        {
            return null;
        }

        return MapTeam(teams[index], index + 1);
    }

    public async Task<IReadOnlyCollection<RatingUserResponse>> GetUsersAsync(RatingQuery query, CancellationToken cancellationToken = default)
    {
        var users = await _dbContext.Users
            .AsNoTracking()
            .Select(user => new
            {
                user.Id,
                user.UserName,
                user.FirstName,
                user.LastName,
                user.MiddleName,
                user.Nickname,
                user.UserPoints,
                user.TeamId,
                AchievementsCount = user.Achievements.Count()
            })
            .ToListAsync(cancellationToken);

        var ranked = users
            .OrderByDescending(user => user.UserPoints)
            .ThenBy(user => user.UserName)
            .Select((user, index) => new RatingUserResponse
            {
                Id = user.Id.ToString(),
                Rank = index + 1,
                Name = BuildUserDisplayName(user.FirstName, user.LastName, user.MiddleName, user.Nickname, user.UserName),
                Points = user.UserPoints,
                HasTeam = user.TeamId is not null,
                TeamId = user.TeamId?.ToString(),
                League = ResolveLeague(user.UserPoints),
                AchievementsCount = user.AchievementsCount
            })
            .ToList();

        var filtered = FilterUsers(ranked, query.Search);
        var sorted = SortUsers(filtered, query.Sort);

        if (query.Limit is > 0)
        {
            sorted = sorted.Take(query.Limit.Value).ToList();
        }

        return sorted;
    }

    public async Task<RatingUserResponse?> GetUserByIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var all = await GetUsersAsync(new RatingQuery(), cancellationToken);
        return all.FirstOrDefault(user => user.Id == userId.ToString());
    }

    private static RatingTeamResponse MapTeam(Team team, int rank)
    {
        return new RatingTeamResponse
        {
            Id = team.Id.ToString(),
            Rank = rank,
            Name = team.Name,
            Points = team.Score,
            Krk = Math.Round(team.KrkCached, 1),
            Members = team.Members
                .OrderByDescending(member => team.CaptainId == member.Id)
                .ThenBy(member => member.UserName)
                .Select(member => new RatingTeamMemberResponse
                {
                    Id = member.Id.ToString(),
                    DisplayName = BuildUserDisplayName(member.FirstName, member.LastName, member.MiddleName, member.Nickname, member.UserName),
                    RoleLabel = team.CaptainId == member.Id ? "КАПИТАН" : "УЧАСТНИК"
                })
                .ToList()
        };
    }

    private static List<RatingTeamResponse> FilterTeams(IEnumerable<RatingTeamResponse> source, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return source.ToList();
        }

        var needle = search.Trim();
        return source
            .Where(team => team.Name.Contains(needle, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    private static List<RatingUserResponse> FilterUsers(IEnumerable<RatingUserResponse> source, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return source.ToList();
        }

        var needle = search.Trim();
        return source
            .Where(user => user.Name.Contains(needle, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    private static List<RatingTeamResponse> SortTeams(List<RatingTeamResponse> source, string? sort) => sort switch
    {
        "rank-desc" => source.OrderByDescending(t => t.Rank).ToList(),
        "points-desc" => source.OrderByDescending(t => t.Points).ThenBy(t => t.Name).ToList(),
        "points-asc" => source.OrderBy(t => t.Points).ThenBy(t => t.Name).ToList(),
        "name-asc" => source.OrderBy(t => t.Name, StringComparer.OrdinalIgnoreCase).ToList(),
        _ => source.OrderBy(t => t.Rank).ToList()
    };

    private static List<RatingUserResponse> SortUsers(List<RatingUserResponse> source, string? sort) => sort switch
    {
        "rank-desc" => source.OrderByDescending(u => u.Rank).ToList(),
        "points-desc" => source.OrderByDescending(u => u.Points).ThenBy(u => u.Name).ToList(),
        "points-asc" => source.OrderBy(u => u.Points).ThenBy(u => u.Name).ToList(),
        "name-asc" => source.OrderBy(u => u.Name, StringComparer.OrdinalIgnoreCase).ToList(),
        _ => source.OrderBy(u => u.Rank).ToList()
    };

    internal static string BuildUserDisplayName(string firstName, string lastName, string middleName, string nickname, string userName)
    {
        var lname = (lastName ?? string.Empty).Trim();
        var fname = (firstName ?? string.Empty).Trim();
        if (lname.Length > 0 || fname.Length > 0)
        {
            var fnameInitial = fname.Length > 0 ? $" {fname[..1].ToUpperInvariant()}." : string.Empty;
            var baseName = (lname + fnameInitial).Trim();
            if (baseName.Length > 0)
            {
                return baseName.ToUpperInvariant();
            }
        }

        if (!string.IsNullOrWhiteSpace(nickname))
        {
            return nickname.Trim().ToUpperInvariant();
        }

        return (userName ?? string.Empty).Trim().ToUpperInvariant();
    }

    /// <summary>
    /// Пороги лиг по персональным очкам:
    /// 0..149 — БАЗОВАЯ, 150..299 — БРОНЗА, 300..399 — СЕРЕБРО, ≥400 — ЗОЛОТО.
    /// </summary>
    internal static string ResolveLeague(int points) => points switch
    {
        >= 400 => "ЗОЛОТО",
        >= 300 => "СЕРЕБРО",
        >= 150 => "БРОНЗА",
        _ => "БАЗОВАЯ"
    };
}
