using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TeamExamProject.Contracts.Ratings;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Options;

namespace TeamExamProject.Services;

/// <summary>
/// Реализация сервиса рейтингов: формирование лидербордов команд и пользователей,
/// расчёт показателей КРК, фильтрация и сортировка результатов.
/// </summary>
public class RatingsService : IRatingsService
{
    private readonly AppDbContext _dbContext;
    private readonly IKrkCalculationService _krkCalculationService;
    private readonly LeagueOptions _leagueOptions;

    /// <summary>
    /// Создаёт экземпляр сервиса рейтингов с зависимостями доступа к данным,
    /// расчёта КРК, достижений и настроек лиг.
    /// </summary>
    public RatingsService(
        AppDbContext dbContext,
        IKrkCalculationService krkCalculationService,
        IOptions<LeagueOptions> leagueOptions)
    {
        _dbContext = dbContext;
        _krkCalculationService = krkCalculationService;
        _leagueOptions = leagueOptions.Value;
    }

    /// <summary>
    /// Возвращает рейтинг команд: обновляет кэш КРК при необходимости, собирает метрики
    /// (сплочённость, бонусы челленджей, чек-ины, спасения), ранжирует, выдаёт достижения топ-3
    /// и применяет фильтры, сортировку и лимит из запроса.
    /// </summary>
    public async Task<IReadOnlyCollection<RatingTeamResponse>> GetTeamsAsync(RatingQuery query, CancellationToken cancellationToken = default)
    {
        await EnsureKrkCacheAsync(cancellationToken);

        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Members)
            .Include(team => team.Captain)
            .ToListAsync(cancellationToken);

        var teamIds = teams.Select(team => team.Id).ToArray();
        var cohesionByTeam = await GetCohesionByTeamAsync(teamIds, cancellationToken);
        var challengeBonusByTeam = await GetChallengeBonusByTeamAsync(teamIds, cancellationToken);
        var checkInsCountByTeam = await GetCheckInsCountByTeamAsync(teamIds, cancellationToken);
        var completedRescuesByTeam = await GetCompletedRescuesCountByTeamAsync(teamIds, cancellationToken);
        var activityByTeam = await GetActivityHistoryByTeamAsync(teamIds, cancellationToken);

        var rankedTeams = teams
            .OrderByDescending(team => team.KrkCached)
            .ThenByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .ToList();

        var ranked = rankedTeams
            .Select((team, index) => MapTeam(
                team,
                index + 1,
                cohesionByTeam.GetValueOrDefault(team.Id),
                challengeBonusByTeam.GetValueOrDefault(team.Id),
                checkInsCountByTeam.GetValueOrDefault(team.Id),
                completedRescuesByTeam.GetValueOrDefault(team.Id),
                activityByTeam.GetValueOrDefault(team.Id) ?? []))
            .ToList();

        var filtered = FilterTeams(ranked, query.Search, query.League);
        var sorted = SortTeams(filtered, query.Sort);

        if (query.Limit is > 0)
        {
            sorted = sorted.Take(query.Limit.Value).ToList();
        }

        return sorted;
    }

    /// <summary>
    /// Возвращает рейтинговую карточку одной команды по идентификатору
    /// или <c>null</c>, если команда не найдена.
    /// </summary>
    public async Task<RatingTeamResponse?> GetTeamByIdAsync(int teamId, CancellationToken cancellationToken = default)
    {
        await EnsureKrkCacheAsync(cancellationToken);

        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Members)
            .Include(team => team.Captain)
            .OrderByDescending(team => team.KrkCached)
            .ThenByDescending(team => team.Score)
            .ThenBy(team => team.Name)
            .ToListAsync(cancellationToken);

        var index = teams.FindIndex(team => team.Id == teamId);
        if (index < 0)
        {
            return null;
        }

        var teamIds = teams.Select(team => team.Id).ToArray();
        var cohesionByTeam = await GetCohesionByTeamAsync(teamIds, cancellationToken);
        var challengeBonusByTeam = await GetChallengeBonusByTeamAsync(teamIds, cancellationToken);
        var checkInsCountByTeam = await GetCheckInsCountByTeamAsync(teamIds, cancellationToken);
        var completedRescuesByTeam = await GetCompletedRescuesCountByTeamAsync(teamIds, cancellationToken);
        var activityByTeam = await GetActivityHistoryByTeamAsync([teamId], cancellationToken);

        var team = teams[index];
        return MapTeam(
            team,
            index + 1,
            cohesionByTeam.GetValueOrDefault(team.Id),
            challengeBonusByTeam.GetValueOrDefault(team.Id),
            checkInsCountByTeam.GetValueOrDefault(team.Id),
            completedRescuesByTeam.GetValueOrDefault(team.Id),
            activityByTeam.GetValueOrDefault(team.Id) ?? []);
    }

    /// <summary>
    /// Возвращает рейтинг пользователей (без администраторов): рассчитывает личный рейтинг
    /// с учётом анонимных оценок вклада, ранжирует и применяет фильтры запроса.
    /// </summary>
    public async Task<IReadOnlyCollection<RatingUserResponse>> GetUsersAsync(RatingQuery query, CancellationToken cancellationToken = default)
    {
        var users = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Role != Models.Roles.Admin)
            .Include(user => user.Team)
            .Include(user => user.Group)
            .Select(user => new RatingUserProjection
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                MiddleName = user.MiddleName,
                Nickname = user.Nickname,
                UserPoints = user.UserPoints,
                TeamId = user.TeamId,
                TeamName = user.Team == null ? string.Empty : user.Team.Name,
                GroupTitle = !string.IsNullOrWhiteSpace(user.AcademicGroupLabel)
                    ? user.AcademicGroupLabel
                    : user.Group == null ? string.Empty : user.Group.Title,
                IsCaptain = user.Team != null && user.Team.CaptainId == user.Id,
                AchievementsCount = user.Achievements.Count(),
                AvatarUrl = user.AvatarUrl
            })
            .ToListAsync(cancellationToken);

        var userIds = users.Select(user => user.Id).ToArray();
        var contributionByUser = await GetContributionByUserAsync(userIds, cancellationToken);

        var ranked = users
            .Select(user =>
            {
                var contribution = contributionByUser.GetValueOrDefault(user.Id);
                return MapUser(user, contribution, rank: 0);
            })
            .OrderByDescending(user => user.Points)
            .ThenBy(user => user.Name)
            .Select((user, index) =>
            {
                user.Rank = index + 1;
                return user;
            })
            .ToList();

        var filtered = FilterUsers(ranked, query);
        var sorted = SortUsers(filtered, query.Sort);

        if (query.Limit is > 0)
        {
            sorted = sorted.Take(query.Limit.Value).ToList();
        }

        return sorted;
    }

    /// <summary>
    /// Возвращает рейтинговую карточку пользователя по идентификатору
    /// или <c>null</c>, если пользователь не найден.
    /// </summary>
    public async Task<RatingUserResponse?> GetUserByIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var users = await GetUsersAsync(new RatingQuery(), cancellationToken);
        return users.SingleOrDefault(user => user.Id == userId.ToString());
    }

    /// <summary>
    /// Гарантирует актуальность кэша КРК: при отсутствии значения у любой команды
    /// запускает полный пересчёт через <see cref="IKrkCalculationService"/>.
    /// </summary>
    private async Task EnsureKrkCacheAsync(CancellationToken cancellationToken)
    {
        var hasMissingKrk = await _dbContext.Teams
            .AsNoTracking()
            .AnyAsync(team => team.KrkCachedAtUtc == null, cancellationToken);

        if (hasMissingKrk)
        {
            await _krkCalculationService.RecalculateAllAsync(cancellationToken);
        }
    }

    private async Task<Dictionary<int, double>> GetCohesionByTeamAsync(int[] teamIds, CancellationToken cancellationToken)
    {
        return await _dbContext.Votes
            .AsNoTracking()
            .Where(vote => teamIds.Contains(vote.TeamId))
            .GroupBy(vote => vote.TeamId)
            .Select(group => new { TeamId = group.Key, Average = Math.Round(group.Average(vote => vote.Score), 1) })
            .ToDictionaryAsync(item => item.TeamId, item => item.Average, cancellationToken);
    }

    /// <summary>
    /// Возвращает среднюю оценку вклада пользователя по анонимным голосам команды.
    /// </summary>
    private async Task<Dictionary<int, double>> GetContributionByUserAsync(int[] userIds, CancellationToken cancellationToken)
    {
        return await _dbContext.Votes
            .AsNoTracking()
            .Where(vote => userIds.Contains(vote.ToUserId))
            .GroupBy(vote => vote.ToUserId)
            .Select(group => new { UserId = group.Key, Average = Math.Round(group.Average(vote => vote.Score), 1) })
            .ToDictionaryAsync(item => item.UserId, item => item.Average, cancellationToken);
    }

    /// <summary>
    /// Суммирует бонусные баллы одобренных челленджей по каждой команде.
    /// </summary>
    private async Task<Dictionary<int, int>> GetChallengeBonusByTeamAsync(int[] teamIds, CancellationToken cancellationToken)
    {
        return await _dbContext.TeamChallengeProgresses
            .AsNoTracking()
            .Where(progress => teamIds.Contains(progress.TeamId) && progress.Status == ChallengeProgressStatuses.Approved)
            .Join(
                _dbContext.Challenges.AsNoTracking(),
                progress => progress.ChallengeId,
                challenge => challenge.Id,
                (progress, challenge) => new { progress.TeamId, challenge.BonusPoints })
            .GroupBy(item => item.TeamId)
            .Select(group => new { TeamId = group.Key, Bonus = group.Sum(item => item.BonusPoints) })
            .ToDictionaryAsync(item => item.TeamId, item => item.Bonus, cancellationToken);
    }

    /// <summary>
    /// Возвращает количество чек-инов по каждой команде.
    /// </summary>
    private async Task<Dictionary<int, int>> GetCheckInsCountByTeamAsync(int[] teamIds, CancellationToken cancellationToken)
    {
        return await _dbContext.CheckIns
            .AsNoTracking()
            .Where(checkIn => teamIds.Contains(checkIn.TeamId))
            .GroupBy(checkIn => checkIn.TeamId)
            .Select(group => new { TeamId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.TeamId, item => item.Count, cancellationToken);
    }

    /// <summary>
    /// Возвращает число завершённых «спасений» (help request) для каждой команды-получателя.
    /// </summary>
    private async Task<Dictionary<int, int>> GetCompletedRescuesCountByTeamAsync(int[] teamIds, CancellationToken cancellationToken)
    {
        return await _dbContext.HelpRequests
            .AsNoTracking()
            .Where(request => teamIds.Contains(request.ToTeamId) && request.Status == HelpRequestStatuses.Completed)
            .GroupBy(request => request.ToTeamId)
            .Select(group => new { TeamId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.TeamId, item => item.Count, cancellationToken);
    }

    /// <summary>
    /// Формирует краткую историю активности команды из ленты событий (до 6 последних записей на команду).
    /// </summary>
    private async Task<Dictionary<int, List<RatingTeamHistoryItemResponse>>> GetActivityHistoryByTeamAsync(
        int[] teamIds,
        CancellationToken cancellationToken)
    {
        var feedItems = await _dbContext.ActivityFeedItems
            .AsNoTracking()
            .Where(item => item.TeamId != null && teamIds.Contains(item.TeamId.Value))
            .OrderByDescending(item => item.CreatedAtUtc)
            .Take(200)
            .ToListAsync(cancellationToken);

        return feedItems
            .GroupBy(item => item.TeamId!.Value)
            .ToDictionary(
                group => group.Key,
                group => group
                    .Take(6)
                    .Select(item => new RatingTeamHistoryItemResponse
                    {
                        Kind = item.Type,
                        Title = item.Message,
                        Meta = item.CreatedAtUtc.ToString("dd.MM.yyyy"),
                        CreatedAtUtc = item.CreatedAtUtc
                    })
                    .ToList());
    }

    /// <summary>
    /// Преобразует сущность команды в DTO рейтинга с переданными метриками и местом в таблице.
    /// </summary>
    private static RatingTeamResponse MapTeam(
        Team team,
        int rank,
        double cohesion,
        int challengeBonus,
        int checkInsCount,
        int completedRescuesCount,
        List<RatingTeamHistoryItemResponse> activityHistory)
    {
        return new RatingTeamResponse
        {
            Id = team.Id.ToString(),
            Rank = rank,
            Name = team.Name,
            Points = team.Score,
            Krk = Math.Round(team.KrkCached, 1),
            League = ResolveTeamLeague(team.KrkCached),
            MemberCount = team.Members.Count,
            CaptainName = team.Captain is null ? string.Empty : DisplayNameFormatter.Format(team.Captain),
            Cohesion = cohesion,
            ChallengeBonus = challengeBonus,
            CheckInsCount = checkInsCount,
            CompletedRescuesCount = completedRescuesCount,
            Members = team.Members
                .OrderByDescending(member => team.CaptainId == member.Id)
                .ThenBy(member => member.UserName)
                .Select(member => new RatingTeamMemberResponse
                {
                    Id = member.Id.ToString(),
                    DisplayName = DisplayNameFormatter.Format(member),
                    RoleLabel = team.CaptainId == member.Id ? "КАПИТАН" : "УЧАСТНИК",
                    AvatarUrl = member.AvatarUrl
                })
                .ToList(),
            ActivityHistory = activityHistory
        };
    }

    /// <summary>
    /// Преобразует проекцию пользователя в DTO рейтинга с личным рейтингом и лигой.
    /// </summary>
    private RatingUserResponse MapUser(RatingUserProjection user, double contribution, int rank)
    {
        var personalRating = CalculatePersonalRating(user.UserPoints, contribution);
        return new RatingUserResponse
        {
            Id = user.Id.ToString(),
            Rank = rank,
            Name = FormatRatingUserName(user.FirstName, user.LastName, user.Nickname, user.UserName),
            Points = personalRating,
            Contribution = contribution,
            HasTeam = user.TeamId is not null,
            TeamId = user.TeamId?.ToString(),
            TeamName = user.TeamName,
            GroupTitle = user.GroupTitle,
            IsCaptain = user.IsCaptain,
            League = ResolveLeague(personalRating),
            AchievementsCount = user.AchievementsCount,
            AvatarUrl = user.AvatarUrl
        };
    }

    /// <summary>
    /// Рассчитывает личный рейтинг: базовые баллы пользователя плюс вклад из голосования
    /// (средняя оценка × 20, округление от нуля).
    /// </summary>
    private static int CalculatePersonalRating(int userPoints, double contribution) =>
        userPoints + (int)Math.Round(contribution * 20d, MidpointRounding.AwayFromZero);

    /// <summary>
    /// Формирует отображаемое имя для рейтинга: ФИО, иначе ник, иначе логин (в верхнем регистре).
    /// </summary>
    private static string FormatRatingUserName(string? firstName, string? lastName, string? nickname, string? userName)
    {
        var first = (firstName ?? string.Empty).Trim();
        var last = (lastName ?? string.Empty).Trim();

        if (first.Length > 0 || last.Length > 0)
        {
            return string.Join(" ", new[] { first, last }.Where(part => part.Length > 0)).ToUpperInvariant();
        }

        if (!string.IsNullOrWhiteSpace(nickname))
        {
            return nickname.Trim().ToUpperInvariant();
        }

        return (userName ?? string.Empty).Trim().ToUpperInvariant();
    }

    /// <summary>
    /// Определяет лигу команды по значению КРК (фиксированные пороги: СТАРТ → НОВИЧОК → ПРОФИ → ЛЕГЕНДА).
    /// </summary>
    private static string ResolveTeamLeague(double krk)
    {
        if (krk >= 8d) return "ЛЕГЕНДА";
        if (krk >= 6.5d) return "ПРОФИ";
        if (krk >= 4d) return "НОВИЧОК";
        return "СТАРТ";
    }

    /// <summary>
    /// Фильтрует команды по подстроке поиска (имя, лига, капитан) и/или точному названию лиги.
    /// </summary>
    private static List<RatingTeamResponse> FilterTeams(IEnumerable<RatingTeamResponse> source, string? search, string? league)
    {
        var teams = source;
        if (!string.IsNullOrWhiteSpace(search))
        {
            var needle = search.Trim();
            teams = teams.Where(team =>
                team.Name.Contains(needle, StringComparison.OrdinalIgnoreCase) ||
                team.League.Contains(needle, StringComparison.OrdinalIgnoreCase) ||
                team.CaptainName.Contains(needle, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(league))
        {
            var leagueNeedle = league.Trim();
            teams = teams.Where(team => team.League.Equals(leagueNeedle, StringComparison.OrdinalIgnoreCase));
        }

        return teams.ToList();
    }

    /// <summary>
    /// Фильтрует пользователей по поиску, команде, учебной группе и лиге из запроса.
    /// </summary>
    private static List<RatingUserResponse> FilterUsers(IEnumerable<RatingUserResponse> source, RatingQuery query)
    {
        var users = source;
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var needle = query.Search.Trim();
            users = users.Where(user =>
                user.Name.Contains(needle, StringComparison.OrdinalIgnoreCase) ||
                user.TeamName.Contains(needle, StringComparison.OrdinalIgnoreCase) ||
                user.GroupTitle.Contains(needle, StringComparison.OrdinalIgnoreCase) ||
                user.League.Contains(needle, StringComparison.OrdinalIgnoreCase));
        }

        if (query.TeamId is > 0)
        {
            users = users.Where(user => user.TeamId == query.TeamId.Value.ToString());
        }

        if (!string.IsNullOrWhiteSpace(query.Group))
        {
            var groupNeedle = query.Group.Trim();
            users = users.Where(user => user.GroupTitle.Contains(groupNeedle, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.League))
        {
            var leagueNeedle = query.League.Trim();
            users = users.Where(user => user.League.Equals(leagueNeedle, StringComparison.OrdinalIgnoreCase));
        }

        return users.ToList();
    }

    /// <summary>
    /// Сортирует команды по ключу <paramref name="sort"/>; по умолчанию — по месту в рейтинге.
    /// </summary>
    private static List<RatingTeamResponse> SortTeams(List<RatingTeamResponse> source, string? sort) => sort switch
    {
        "rank-desc" => source.OrderByDescending(t => t.Rank).ToList(),
        "points-desc" => source.OrderByDescending(t => t.Krk).ThenByDescending(t => t.Points).ThenBy(t => t.Name).ToList(),
        "points-asc" => source.OrderBy(t => t.Krk).ThenBy(t => t.Name).ToList(),
        "name-asc" => source.OrderBy(t => t.Name, StringComparer.OrdinalIgnoreCase).ToList(),
        _ => source.OrderBy(t => t.Rank).ToList()
    };

    /// <summary>
    /// Сортирует пользователей по ключу <paramref name="sort"/>; по умолчанию — по месту в рейтинге.
    /// </summary>
    private static List<RatingUserResponse> SortUsers(List<RatingUserResponse> source, string? sort) => sort switch
    {
        "rank-desc" => source.OrderByDescending(u => u.Rank).ToList(),
        "points-desc" => source.OrderByDescending(u => u.Points).ThenBy(u => u.Name).ToList(),
        "points-asc" => source.OrderBy(u => u.Points).ThenBy(u => u.Name).ToList(),
        "name-asc" => source.OrderBy(u => u.Name, StringComparer.OrdinalIgnoreCase).ToList(),
        _ => source.OrderBy(u => u.Rank).ToList()
    };

    /// <summary>
    /// Определяет лигу пользователя по личному рейтингу и порогам из <see cref="LeagueOptions"/>.
    /// </summary>
    private string ResolveLeague(int points)
    {
        if (points >= _leagueOptions.GoldThreshold) return _leagueOptions.GoldLabel;
        if (points >= _leagueOptions.SilverThreshold) return _leagueOptions.SilverLabel;
        if (points >= _leagueOptions.BronzeThreshold) return _leagueOptions.BronzeLabel;
        return _leagueOptions.BaseLabel;
    }

    /// <summary>
    /// Промежуточная проекция данных пользователя для построения рейтинга без лишних JOIN в памяти.
    /// </summary>
    private sealed class RatingUserProjection
    {
        /// <summary>Идентификатор пользователя.</summary>
        public int Id { get; init; }

        /// <summary>Логин пользователя.</summary>
        public string UserName { get; init; } = string.Empty;

        /// <summary>Имя.</summary>
        public string FirstName { get; init; } = string.Empty;

        /// <summary>Фамилия.</summary>
        public string LastName { get; init; } = string.Empty;

        /// <summary>Отчество.</summary>
        public string MiddleName { get; init; } = string.Empty;

        /// <summary>Никнейм.</summary>
        public string Nickname { get; init; } = string.Empty;

        /// <summary>Базовые баллы пользователя (до учёта вклада из голосования).</summary>
        public int UserPoints { get; init; }

        /// <summary>Идентификатор команды или <c>null</c>, если пользователь без команды.</summary>
        public int? TeamId { get; init; }

        /// <summary>Название команды.</summary>
        public string TeamName { get; init; } = string.Empty;

        /// <summary>Название учебной группы.</summary>
        public string GroupTitle { get; init; } = string.Empty;

        /// <summary>Признак капитана текущей команды.</summary>
        public bool IsCaptain { get; init; }

        /// <summary>Количество полученных достижений.</summary>
        public int AchievementsCount { get; init; }

        /// <summary>URL аватара.</summary>
        public string AvatarUrl { get; init; } = string.Empty;
    }
}
