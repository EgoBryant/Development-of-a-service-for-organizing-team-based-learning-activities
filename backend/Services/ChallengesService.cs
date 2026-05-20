using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Challenges;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class ChallengesService : IChallengesService
{
    private readonly AppDbContext _dbContext;
    private readonly IKrkCalculationService _krkCalculationService;
    private readonly IActivityFeedService _activityFeed;
    private readonly IAchievementsService _achievements;

    public ChallengesService(
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

    public async Task<IReadOnlyCollection<ChallengeResponse>> GetActiveAsync(int? currentUserTeamId, CancellationToken cancellationToken = default)
    {
        var challenges = await _dbContext.Challenges
            .AsNoTracking()
            .Where(challenge => challenge.IsActive)
            .OrderBy(challenge => challenge.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var progressLookup = await _dbContext.TeamChallengeProgresses
            .AsNoTracking()
            .Where(progress => challenges.Select(c => c.Id).Contains(progress.ChallengeId))
            .ToListAsync(cancellationToken);

        return challenges.Select(challenge =>
        {
            var teamStatus = currentUserTeamId is null
                ? null
                : progressLookup
                    .FirstOrDefault(progress => progress.ChallengeId == challenge.Id && progress.TeamId == currentUserTeamId.Value)?.Status;

            var approved = progressLookup
                .Count(progress => progress.ChallengeId == challenge.Id && progress.Status == ChallengeProgressStatuses.Approved);

            return new ChallengeResponse
            {
                Id = challenge.Id,
                Title = challenge.Title,
                Description = challenge.Description,
                BonusPoints = challenge.BonusPoints,
                IsActive = challenge.IsActive,
                StartsAtUtc = challenge.StartsAtUtc,
                EndsAtUtc = challenge.EndsAtUtc,
                TeamStatus = teamStatus,
                ApprovedTeamsCount = approved
            };
        }).ToList();
    }

    public async Task<ChallengeResponse> CreateAsync(CreateChallengeDto request, CancellationToken cancellationToken = default)
    {
        var challenge = new Challenge
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            BonusPoints = request.BonusPoints,
            IsActive = request.IsActive,
            StartsAtUtc = request.StartsAtUtc,
            EndsAtUtc = request.EndsAtUtc,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Challenges.Add(challenge);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new ChallengeResponse
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Description = challenge.Description,
            BonusPoints = challenge.BonusPoints,
            IsActive = challenge.IsActive,
            StartsAtUtc = challenge.StartsAtUtc,
            EndsAtUtc = challenge.EndsAtUtc,
            TeamStatus = null,
            ApprovedTeamsCount = 0
        };
    }

    public async Task<ChallengeProgressSubmitResult> SubmitAsync(int userId, int challengeId, SubmitChallengeDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existing => existing.Id == userId, cancellationToken);
        if (user is null)
        {
            return new ChallengeProgressSubmitResult { Type = ChallengeProgressSubmitResultType.UserNotFound };
        }
        if (user.TeamId is null)
        {
            return new ChallengeProgressSubmitResult { Type = ChallengeProgressSubmitResultType.UserHasNoTeam };
        }

        var challenge = await _dbContext.Challenges.SingleOrDefaultAsync(existing => existing.Id == challengeId, cancellationToken);
        if (challenge is null)
        {
            return new ChallengeProgressSubmitResult { Type = ChallengeProgressSubmitResultType.ChallengeNotFound };
        }
        if (!challenge.IsActive)
        {
            return new ChallengeProgressSubmitResult { Type = ChallengeProgressSubmitResultType.ChallengeInactive };
        }

        var existingProgress = await _dbContext.TeamChallengeProgresses
            .Where(progress => progress.ChallengeId == challengeId && progress.TeamId == user.TeamId.Value)
            .Where(progress => progress.Status != ChallengeProgressStatuses.Rejected)
            .SingleOrDefaultAsync(cancellationToken);

        if (existingProgress is not null)
        {
            return new ChallengeProgressSubmitResult { Type = ChallengeProgressSubmitResultType.AlreadySubmitted };
        }

        var progressEntry = new TeamChallengeProgress
        {
            ChallengeId = challengeId,
            TeamId = user.TeamId.Value,
            SubmittedByUserId = userId,
            ProofText = request.ProofText.Trim(),
            Status = ChallengeProgressStatuses.Submitted,
            SubmittedAtUtc = DateTime.UtcNow
        };

        _dbContext.TeamChallengeProgresses.Add(progressEntry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _activityFeed.AppendAsync(
            ActivityFeedItemTypes.ChallengeSubmitted,
            $"Команда отправила челлендж «{challenge.Title}» на проверку.",
            user.TeamId,
            userId,
            cancellationToken);

        await _achievements.GrantIfMissingAsync(userId, AchievementCodes.FirstChallenge, cancellationToken);

        return new ChallengeProgressSubmitResult
        {
            Type = ChallengeProgressSubmitResultType.Submitted,
            Progress = await BuildProgressAsync(progressEntry.Id, cancellationToken)
        };
    }

    public async Task<ChallengeProgressReviewResult> ReviewAsync(int progressId, ReviewChallengeProgressDto request, CancellationToken cancellationToken = default)
    {
        var status = request.Status?.Trim();
        if (string.IsNullOrEmpty(status) ||
            (!status.Equals(ChallengeProgressStatuses.Approved, StringComparison.OrdinalIgnoreCase) &&
             !status.Equals(ChallengeProgressStatuses.Rejected, StringComparison.OrdinalIgnoreCase)))
        {
            return new ChallengeProgressReviewResult { Type = ChallengeProgressReviewResultType.InvalidStatus };
        }

        var progressEntry = await _dbContext.TeamChallengeProgresses
            .Include(progress => progress.Challenge)
            .Include(progress => progress.Team)
            .SingleOrDefaultAsync(progress => progress.Id == progressId, cancellationToken);

        if (progressEntry is null)
        {
            return new ChallengeProgressReviewResult { Type = ChallengeProgressReviewResultType.NotFound };
        }

        var normalized = status.Equals(ChallengeProgressStatuses.Approved, StringComparison.OrdinalIgnoreCase)
            ? ChallengeProgressStatuses.Approved
            : ChallengeProgressStatuses.Rejected;

        var wasApproved = progressEntry.Status == ChallengeProgressStatuses.Approved;
        var willBeApproved = normalized == ChallengeProgressStatuses.Approved;

        progressEntry.Status = normalized;
        progressEntry.ReviewedAtUtc = DateTime.UtcNow;

        if (!wasApproved && willBeApproved && progressEntry.Challenge is not null && progressEntry.Team is not null)
        {
            progressEntry.Team.Score += progressEntry.Challenge.BonusPoints;
            await _activityFeed.AppendAsync(
                ActivityFeedItemTypes.ChallengeApproved,
                $"Команде «{progressEntry.Team.Name}» засчитали челлендж «{progressEntry.Challenge.Title}» (+{progressEntry.Challenge.BonusPoints} баллов).",
                progressEntry.TeamId,
                null,
                cancellationToken);
        }
        else if (wasApproved && !willBeApproved && progressEntry.Challenge is not null && progressEntry.Team is not null)
        {
            progressEntry.Team.Score = Math.Max(0, progressEntry.Team.Score - progressEntry.Challenge.BonusPoints);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        if (wasApproved != willBeApproved)
        {
            await _krkCalculationService.RecalculateForTeamAsync(progressEntry.TeamId, cancellationToken);
        }

        return new ChallengeProgressReviewResult
        {
            Type = ChallengeProgressReviewResultType.Updated,
            Progress = await BuildProgressAsync(progressEntry.Id, cancellationToken)
        };
    }

    public async Task<IReadOnlyCollection<ChallengeProgressResponse>> GetTeamProgressAsync(int teamId, CancellationToken cancellationToken = default)
    {
        var entries = await _dbContext.TeamChallengeProgresses
            .AsNoTracking()
            .Include(progress => progress.Challenge)
            .Include(progress => progress.Team)
            .Include(progress => progress.SubmittedByUser)
            .Where(progress => progress.TeamId == teamId)
            .OrderByDescending(progress => progress.SubmittedAtUtc)
            .ToListAsync(cancellationToken);

        return entries.Select(MapProgress).ToList();
    }

    private async Task<ChallengeProgressResponse> BuildProgressAsync(int progressId, CancellationToken cancellationToken)
    {
        var progress = await _dbContext.TeamChallengeProgresses
            .AsNoTracking()
            .Include(p => p.Challenge)
            .Include(p => p.Team)
            .Include(p => p.SubmittedByUser)
            .SingleAsync(p => p.Id == progressId, cancellationToken);
        return MapProgress(progress);
    }

    private static ChallengeProgressResponse MapProgress(TeamChallengeProgress progress) => new()
    {
        Id = progress.Id,
        ChallengeId = progress.ChallengeId,
        ChallengeTitle = progress.Challenge?.Title ?? string.Empty,
        TeamId = progress.TeamId,
        TeamName = progress.Team?.Name ?? string.Empty,
        SubmittedByUserId = progress.SubmittedByUserId,
        SubmittedByUserName = progress.SubmittedByUser?.UserName ?? string.Empty,
        ProofText = progress.ProofText,
        Status = progress.Status,
        BonusPoints = progress.Challenge?.BonusPoints ?? 0,
        SubmittedAtUtc = progress.SubmittedAtUtc,
        ReviewedAtUtc = progress.ReviewedAtUtc
    };
}
