using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text.RegularExpressions;
using TeamExamProject.Contracts.ActivityFeed;
using TeamExamProject.Contracts.Teams;
using TeamExamProject.Data;
using TeamExamProject.Models;
using TeamExamProject.Options;

namespace TeamExamProject.Services;

/// <summary>
/// Реализация сервиса управления командами: CRUD, вступление по инвайт-коду,
/// заявки на вступление, недельная статистика и жизненный цикл команды.
/// </summary>
public class TeamService : ITeamService
{
    /// <summary>Алфавит для генерации инвайт-кодов (без похожих символов O/0, I/1).</summary>
    private const string InviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    /// <summary>Контекст базы данных приложения.</summary>
    private readonly AppDbContext _dbContext;

    /// <summary>Сервис пересчёта командного рейтингового коэффициента (КРК).</summary>
    private readonly IKrkCalculationService _krkCalculationService;

    /// <summary>Сервис записи событий в ленту активности команд.</summary>
    private readonly IActivityFeedService _activityFeed;
    private readonly IAchievementsService _achievementsService;
    private readonly ITeamScoreService _teamScoreService;
    private readonly TeamOptions _teamOptions;

    /// <summary>
    /// Создаёт экземпляр сервиса команд с зависимостями БД, расчёта КРК, ленты активности и настроек.
    /// </summary>
    /// <param name="dbContext">Контекст базы данных.</param>
    /// <param name="krkCalculationService">Сервис пересчёта командного рейтингового коэффициента.</param>
    /// <param name="activityFeed">Сервис записи событий в ленту активности.</param>
    /// <param name="teamOptions">Настройки команд (лимит участников и др.).</param>
    public TeamService(
        AppDbContext dbContext,
        IKrkCalculationService krkCalculationService,
        IActivityFeedService activityFeed,
        IAchievementsService achievementsService,
        ITeamScoreService teamScoreService,
        IOptions<TeamOptions> teamOptions)
    {
        _dbContext = dbContext;
        _krkCalculationService = krkCalculationService;
        _activityFeed = activityFeed;
        _achievementsService = achievementsService;
        _teamScoreService = teamScoreService;
        _teamOptions = teamOptions.Value;
    }

    /// <summary>
    /// Возвращает все команды, отсортированные по убыванию счёта и имени.
    /// </summary>
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

    /// <summary>
    /// Ищет команды по названию, описанию или инвайт-коду с ограничением числа результатов.
    /// </summary>
    /// <param name="query">Текстовый запрос; пустая строка возвращает команды без фильтра.</param>
    /// <param name="limit">Максимальное число результатов (ограничивается диапазоном 1–50).</param>
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

    /// <summary>
    /// Возвращает команду по идентификатору или <c>null</c>, если команда не найдена.
    /// </summary>
    /// <param name="teamId">Идентификатор команды.</param>
    public async Task<TeamResponse?> GetByIdAsync(int teamId, CancellationToken cancellationToken = default)
    {
        var team = await _dbContext.Teams
            .AsNoTracking()
            .Include(existingTeam => existingTeam.Captain)
            .Include(existingTeam => existingTeam.Members)
            .SingleOrDefaultAsync(existingTeam => existingTeam.Id == teamId, cancellationToken);

        return team is null ? null : MapTeamResponse(team);
    }

    /// <summary>
    /// Возвращает команду по инвайт-коду после нормализации (обрезка пробелов, верхний регистр).
    /// </summary>
    /// <param name="inviteCode">Инвайт-код команды.</param>
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

    /// <summary>
    /// Возвращает команду, в которой состоит указанный пользователь, или <c>null</c>.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    public async Task<TeamResponse?> GetForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var teamId = await GetTeamIdForUserAsync(userId, cancellationToken);
        return teamId is null ? null : await GetByIdAsync(teamId.Value, cancellationToken);
    }

    /// <summary>
    /// Возвращает ленту активности команды пользователя в хронологическом порядке (новые первыми).
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    /// <param name="limit">Максимальное число записей (ограничивается диапазоном 1–100).</param>
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

    /// <summary>
    /// Собирает недельную статистику команды пользователя: баллы, «спасения» и проведённые мероприятия.
    /// </summary>
    /// <remarks>
    /// Неделя считается с понедельника 00:00 UTC. Баллы начисляются за завершённые «спасения»
    /// (сопоставление темы из ленты с заявкой HelpRequest) и одобренные челленджи
    /// (извлечение числа из текста сообщения ленты).
    /// </remarks>
    /// <param name="userId">Идентификатор пользователя.</param>
    public async Task<TeamWeeklyStatsResponse?> GetWeeklyStatsForUserTeamAsync(int userId, CancellationToken cancellationToken = default)
    {
        var teamId = await GetTeamIdForUserAsync(userId, cancellationToken);
        if (teamId is null)
        {
            return null;
        }

        var weekStart = GetWeekStartUtc(DateTime.UtcNow);
        var weekEnd = weekStart.AddDays(7);

        var weekActivities = await _dbContext.ActivityFeedItems
            .AsNoTracking()
            .Where(item => item.TeamId == teamId.Value && item.CreatedAtUtc >= weekStart && item.CreatedAtUtc < weekEnd)
            .ToListAsync(cancellationToken);

        var eventsHeld = weekActivities.Count(item => item.Type == ActivityFeedItemTypes.EventCreated);
        var rescueActivities = weekActivities
            .Where(item => item.Type == ActivityFeedItemTypes.HelpRequestCompleted)
            .ToList();
        var teamsRescued = rescueActivities.Count;

        var pointsEarned = 0;

        if (rescueActivities.Count > 0)
        {
            var completedRescues = await _dbContext.HelpRequests
                .AsNoTracking()
                .Where(request =>
                    request.ToTeamId == teamId.Value &&
                    request.Status == HelpRequestStatuses.Completed &&
                    request.BonusAwarded)
                .ToListAsync(cancellationToken);

            foreach (var activity in rescueActivities)
            {
                var topic = ExtractHelpCompletedTopic(activity.Message);
                if (topic is null)
                {
                    continue;
                }

                var matchedRequest = completedRescues.FirstOrDefault(request =>
                    request.Topic.Equals(topic, StringComparison.OrdinalIgnoreCase));
                if (matchedRequest is not null)
                {
                    pointsEarned += (int)Math.Round(matchedRequest.BonusPoints, MidpointRounding.AwayFromZero);
                }
            }
        }

        foreach (var activity in weekActivities.Where(item => item.Type == ActivityFeedItemTypes.ChallengeApproved))
        {
            pointsEarned += ExtractBonusPointsFromActivityMessage(activity.Message);
        }

        return new TeamWeeklyStatsResponse
        {
            PointsEarned = pointsEarned,
            TeamsRescued = teamsRescued,
            EventsHeld = eventsHeld,
            WeekStartUtc = weekStart,
            WeekEndUtc = weekEnd
        };
    }

    /// <summary>
    /// Возвращает идентификатор команды пользователя или <c>null</c>, если пользователь не состоит в команде.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    public Task<int?> GetTeamIdForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.TeamId)
            .SingleOrDefaultAsync(cancellationToken);
    }

    /// <summary>
    /// Создаёт новую команду: пользователь становится капитаном, генерируется уникальный инвайт-код.
    /// </summary>
    /// <remarks>
    /// Перед созданием проверяется, что пользователь существует и не состоит в другой команде.
    /// Отменяются все его ожидающие заявки, записывается событие в ленту и пересчитывается КРК.
    /// </remarks>
    /// <param name="userId">Идентификатор создателя (будущего капитана).</param>
    /// <param name="request">Данные новой команды (название и описание).</param>
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

        await _achievementsService.GrantIfMissingAsync(user.Id, AchievementCodes.FirstVote, cancellationToken);
        await _teamScoreService.RecalculateTeamScoreAsync(team.Id, recalculateKrk: false, cancellationToken);

        return new CreateTeamResult
        {
            Type = CreateTeamResultType.Created,
            Team = await GetByIdAsync(team.Id, cancellationToken)
        };
    }

    /// <summary>
    /// Мгновенное вступление в команду по инвайт-коду без рассмотрения заявки капитаном.
    /// </summary>
    /// <remarks>
    /// Альтернатива заявке на вступление (<see cref="CreateJoinRequestAsync"/>): пользователь сразу
    /// становится участником, если команда не заполнена. Отменяются все его ожидающие заявки.
    /// </remarks>
    /// <param name="userId">Идентификатор вступающего пользователя.</param>
    /// <param name="request">Запрос с инвайт-кодом команды.</param>
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

        if (await IsTeamFullAsync(team.Id, cancellationToken))
        {
            return new JoinTeamResult { Type = JoinTeamResultType.TeamFull };
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

        await _achievementsService.GrantIfMissingAsync(user.Id, AchievementCodes.FirstVote, cancellationToken);
        await _teamScoreService.RecalculateTeamScoreAsync(team.Id, cancellationToken: cancellationToken);

        return new JoinTeamResult
        {
            Type = JoinTeamResultType.Joined,
            Team = await GetByIdAsync(team.Id, cancellationToken)
        };
    }

    /// <summary>
    /// Возвращает заявки на вступление с учётом роли пользователя и области выборки.
    /// </summary>
    /// <remarks>
    /// <paramref name="scope"/> определяет фильтр:
    /// <c>incoming</c> — входящие заявки в команду капитана;
    /// <c>outgoing</c> — исходящие заявки пользователя;
    /// <c>all</c> — все заявки (только для администратора);
    /// по умолчанию капитан видит входящие и свои исходящие, обычный пользователь — только свои.
    /// </remarks>
    /// <param name="userId">Идентификатор запрашивающего пользователя.</param>
    /// <param name="scope">Область выборки заявок.</param>
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

    /// <summary>
    /// Создаёт заявку на вступление в команду по её идентификатору (без инвайт-кода).
    /// </summary>
    /// <remarks>
    /// Заявка ожидает решения капитана или администратора. Дубликаты ожидающих заявок
    /// в ту же команду отклоняются. При успехе событие фиксируется в ленте активности.
    /// </remarks>
    /// <param name="userId">Идентификатор подающего заявку пользователя.</param>
    /// <param name="request">Идентификатор команды и сопроводительное сообщение.</param>
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

        if (await IsTeamFullAsync(team.Id, cancellationToken))
        {
            return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.TeamFull };
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

    /// <summary>
    /// Обновляет статус заявки на вступление: принятие, отклонение или отмена.
    /// </summary>
    /// <remarks>
    /// Принять или отклонить может капитан целевой команды или администратор.
    /// Отменить может только заявитель или администратор. При принятии заявитель
    /// добавляется в команду, остальные его ожидающие заявки отменяются (кроме текущей).
    /// Изменить можно только заявки в статусе Pending.
    /// </remarks>
    /// <param name="userId">Идентификатор пользователя, выполняющего действие.</param>
    /// <param name="requestId">Идентификатор заявки.</param>
    /// <param name="request">Новый статус заявки.</param>
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

            if (await IsTeamFullAsync(joinRequest.TeamId, cancellationToken))
            {
                return new TeamJoinRequestResult { Type = TeamJoinRequestResultType.TeamFull };
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

            await _achievementsService.GrantIfMissingAsync(joinRequest.UserId, AchievementCodes.FirstVote, cancellationToken);
            await _teamScoreService.RecalculateTeamScoreAsync(joinRequest.TeamId, cancellationToken: cancellationToken);
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

    /// <summary>
    /// Расформировывает команду: доступно только капитану.
    /// </summary>
    /// <remarks>
    /// Удаляет связанные заявки «спасения», снимает всех участников с команды,
    /// обнуляет роли капитанов и удаляет запись команды из БД.
    /// </remarks>
    /// <param name="userId">Идентификатор капитана, инициирующего расформирование.</param>
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

    /// <summary>
    /// Обновляет название команды текущего капитана.
    /// </summary>
    public async Task<UpdateTeamResult> UpdateMyTeamAsync(int userId, UpdateTeamDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new UpdateTeamResult { Type = UpdateTeamResultType.UserNotFound };
        }

        if (user.TeamId is null)
        {
            return new UpdateTeamResult { Type = UpdateTeamResultType.NotInTeam };
        }

        var team = await _dbContext.Teams.SingleOrDefaultAsync(existingTeam => existingTeam.Id == user.TeamId, cancellationToken);
        if (team is null)
        {
            return new UpdateTeamResult { Type = UpdateTeamResultType.NotInTeam };
        }

        if (team.CaptainId != userId)
        {
            return new UpdateTeamResult { Type = UpdateTeamResultType.NotCaptain };
        }

        var name = request.Name.Trim();
        if (string.IsNullOrEmpty(name))
        {
            return new UpdateTeamResult { Type = UpdateTeamResultType.InvalidName };
        }

        team.Name = name;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.TeamUpdated,
            $"Капитан переименовал команду в «{team.Name}».",
            team.Id,
            user.Id,
            cancellationToken);

        return new UpdateTeamResult
        {
            Type = UpdateTeamResultType.Updated,
            Team = await GetByIdAsync(team.Id, cancellationToken)
        };
    }

    /// <summary>
    /// Выход участника из команды (капитан не может покинуть команду — только расформировать).
    /// </summary>
    /// <remarks>
    /// После выхода отменяются ожидающие заявки пользователя и пересчитывается КРК команды.
    /// </remarks>
    /// <param name="userId">Идентификатор выходящего участника.</param>
    public async Task<LeaveTeamResult> LeaveAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new LeaveTeamResult { Type = LeaveTeamResultType.UserNotFound };
        }

        if (user.TeamId is null)
        {
            return new LeaveTeamResult { Type = LeaveTeamResultType.NotInTeam };
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
            return new LeaveTeamResult { Type = LeaveTeamResultType.NotInTeam };
        }

        if (team.CaptainId == userId)
        {
            return new LeaveTeamResult { Type = LeaveTeamResultType.IsCaptain };
        }

        var teamId = team.Id;
        user.TeamId = null;
        if (user.Role == Roles.Captain)
        {
            user.Role = Roles.Student;
        }

        await CancelPendingJoinRequestsForUserAsync(user.Id, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _teamScoreService.RecalculateTeamScoreAsync(teamId, cancellationToken: cancellationToken);

        return new LeaveTeamResult { Type = LeaveTeamResultType.Left };
    }

    /// <summary>
    /// Пересчитывает командный счёт как сумму баллов участников и обновляет КРК.
    /// </summary>
    /// <param name="teamId">Идентификатор команды.</param>
    /// <param name="request">Зарезервировано для обратной совместимости API.</param>
    public async Task<TeamResponse?> UpdateScoreAsync(int teamId, UpdateTeamScoreRequest request, CancellationToken cancellationToken = default)
    {
        _ = request;

        var team = await _dbContext.Teams
            .AsNoTracking()
            .AnyAsync(existingTeam => existingTeam.Id == teamId, cancellationToken);
        if (!team)
        {
            return null;
        }

        await _teamScoreService.RecalculateTeamScoreAsync(teamId, cancellationToken: cancellationToken);

        var refreshed = await _dbContext.Teams
            .AsNoTracking()
            .Include(existing => existing.Captain)
            .Include(existing => existing.Members)
            .SingleAsync(existing => existing.Id == teamId, cancellationToken);

        return MapTeamResponse(refreshed);
    }

    /// <summary>
    /// Проверяет, достигнут ли лимит участников команды (<see cref="TeamOptions.MaxMembers"/>).
    /// </summary>
    private async Task<bool> IsTeamFullAsync(int teamId, CancellationToken cancellationToken)
    {
        var memberCount = await _dbContext.Users.CountAsync(user => user.TeamId == teamId, cancellationToken);
        return memberCount >= _teamOptions.MaxMembers;
    }

    /// <summary>
    /// Генерирует уникальный 6-символьный инвайт-код из <see cref="InviteAlphabet"/>.
    /// </summary>
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

    /// <summary>
    /// Отменяет все ожидающие заявки пользователя, опционально кроме указанной.
    /// </summary>
    /// <remarks>
    /// Вызывается при вступлении, создании команды или принятии заявки,
    /// чтобы у пользователя не оставалось параллельных pending-заявок.
    /// </remarks>
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

    /// <summary>
    /// Загружает заявку на вступление по идентификатору и преобразует в DTO ответа.
    /// </summary>
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

    /// <summary>Нормализует инвайт-код: обрезка пробелов и приведение к верхнему регистру.</summary>
    private static string NormalizeInviteCode(string inviteCode) =>
        inviteCode.Trim().ToUpperInvariant();

    /// <summary>
    /// Приводит строковый статус заявки к каноническому значению или возвращает <c>null</c> при неизвестном статусе.
    /// </summary>
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

    /// <summary>Преобразует запись ленты активности в DTO ответа.</summary>
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

    /// <summary>Возвращает начало текущей недели (понедельник 00:00 UTC).</summary>
    private static DateTime GetWeekStartUtc(DateTime utcNow)
    {
        var utcDate = DateTime.SpecifyKind(utcNow.Date, DateTimeKind.Utc);
        var daysSinceMonday = ((int)utcDate.DayOfWeek + 6) % 7;
        return utcDate.AddDays(-daysSinceMonday);
    }

    /// <summary>
    /// Извлекает тему завершённого «спасения» из текста сообщения ленты активности.
    /// </summary>
    private static string? ExtractHelpCompletedTopic(string message)
    {
        var match = Regex.Match(message, @"«Спасение» завершено: «(.+?)»", RegexOptions.CultureInvariant);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    /// <summary>
    /// Извлекает число бонусных баллов из текста сообщения ленты (шаблон «(+N бал...»).
    /// </summary>
    private static int ExtractBonusPointsFromActivityMessage(string message)
    {
        var match = Regex.Match(message, @"\(\+(\d+)\s+бал", RegexOptions.CultureInvariant | RegexOptions.IgnoreCase);
        return match.Success && int.TryParse(match.Groups[1].Value, out var points) ? points : 0;
    }

    /// <summary>Преобразует заявку на вступление в DTO ответа.</summary>
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

    /// <summary>
    /// Преобразует сущность команды в DTO ответа с участниками (капитан первым).
    /// </summary>
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

    /// <summary>Форматирует отображаемое имя пользователя или пустую строку.</summary>
    private static string FormatUser(User? user) =>
        user is null ? string.Empty : DisplayNameFormatter.Format(user);
}
