using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TeamExamProject.Contracts.Ratings;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Options;

namespace TeamExamProject.Services;

public class RatingsService : IRatingsService
{
    private readonly AppDbContext _dbContext;
    private readonly LeagueOptions _leagueOptions;

    public RatingsService(AppDbContext dbContext, IOptions<LeagueOptions> leagueOptions)
    {
        _dbContext = dbContext;
        _leagueOptions = leagueOptions.Value;
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
                Name = DisplayNameFormatter.Format(user.FirstName, user.LastName, user.MiddleName, user.Nickname, user.UserName),
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
        var target = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
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
            .SingleOrDefaultAsync(cancellationToken);

        if (target is null)
        {
            return null;
        }

        // Rank считаем подзапросом: 1 + count(users with more points OR equal points and lexicographically earlier).
        var rank = 1 + await _dbContext.Users.AsNoTracking()
            .CountAsync(user =>
                user.UserPoints > target.UserPoints
                || (user.UserPoints == target.UserPoints &&
                    string.Compare(user.UserName, target.UserName, StringComparison.Ordinal) < 0),
                cancellationToken);

        return new RatingUserResponse
        {
            Id = target.Id.ToString(),
            Rank = rank,
            Name = DisplayNameFormatter.Format(target.FirstName, target.LastName, target.MiddleName, target.Nickname, target.UserName),
            Points = target.UserPoints,
            HasTeam = target.TeamId is not null,
            TeamId = target.TeamId?.ToString(),
            League = ResolveLeague(target.UserPoints),
            AchievementsCount = target.AchievementsCount
        };
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
                    DisplayName = DisplayNameFormatter.Format(member),
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

    /// <summary>
    /// Резолвит лигу по персональным очкам пользователя в соответствии с <see cref="LeagueOptions"/>.
    /// </summary>
    private string ResolveLeague(int points)
    {
        if (points >= _leagueOptions.GoldThreshold) return _leagueOptions.GoldLabel;
        if (points >= _leagueOptions.SilverThreshold) return _leagueOptions.SilverLabel;
        if (points >= _leagueOptions.BronzeThreshold) return _leagueOptions.BronzeLabel;
        return _leagueOptions.BaseLabel;
    }
}
