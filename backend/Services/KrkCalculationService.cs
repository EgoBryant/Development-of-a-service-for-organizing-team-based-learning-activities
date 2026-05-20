using Microsoft.EntityFrameworkCore;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

/// <summary>
/// Реализует формулу КРК (0–10):
/// <list type="bullet">
///   <item><c>baseRatingNormalized</c> — <see cref="Team.Score"/>, нормализованный к 0–10 относительно максимума по выборке.</item>
///   <item><c>cohesionNormalized</c> — среднее голосов команды (шкала 1–5) → 0–10.</item>
///   <item><c>challengeBonusNormalized</c> — суммарный бонус за выполненные челленджи, нормализован к 0–10.</item>
/// </list>
/// Веса: 0.6 / 0.3 / 0.1. Если данных нет — компонент = 0.
/// </summary>
public class KrkCalculationService : IKrkCalculationService
{
    private const double BaseWeight = 0.6;
    private const double CohesionWeight = 0.3;
    private const double ChallengeWeight = 0.1;

    private readonly AppDbContext _dbContext;

    public KrkCalculationService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<double> RecalculateForTeamAsync(int teamId, CancellationToken cancellationToken = default)
    {
        var team = await _dbContext.Teams.SingleOrDefaultAsync(t => t.Id == teamId, cancellationToken);
        if (team is null)
        {
            return 0d;
        }

        var maxScore = await _dbContext.Teams.AsNoTracking().MaxAsync(t => (int?)t.Score, cancellationToken) ?? 0;
        var maxBonus = await _dbContext.TeamChallengeProgresses.AsNoTracking()
            .Where(p => p.Status == ChallengeProgressStatuses.Approved)
            .Join(_dbContext.Challenges.AsNoTracking(), p => p.ChallengeId, c => c.Id, (p, c) => new { p.TeamId, c.BonusPoints })
            .GroupBy(x => x.TeamId)
            .Select(g => g.Sum(x => x.BonusPoints))
            .MaxAsync(s => (int?)s, cancellationToken) ?? 0;

        var krk = await CalculateAsync(team, maxScore, maxBonus, cancellationToken);

        team.KrkCached = krk;
        team.KrkCachedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return krk;
    }

    public async Task RecalculateAllAsync(CancellationToken cancellationToken = default)
    {
        var teams = await _dbContext.Teams.ToListAsync(cancellationToken);
        if (teams.Count == 0)
        {
            return;
        }

        var maxScore = teams.Max(t => t.Score);
        var approvedBonuses = await _dbContext.TeamChallengeProgresses.AsNoTracking()
            .Where(p => p.Status == ChallengeProgressStatuses.Approved)
            .Join(_dbContext.Challenges.AsNoTracking(), p => p.ChallengeId, c => c.Id, (p, c) => new { p.TeamId, c.BonusPoints })
            .GroupBy(x => x.TeamId)
            .Select(g => new { TeamId = g.Key, Bonus = g.Sum(x => x.BonusPoints) })
            .ToListAsync(cancellationToken);

        var maxBonus = approvedBonuses.Count == 0 ? 0 : approvedBonuses.Max(b => b.Bonus);

        foreach (var team in teams)
        {
            var krk = await CalculateAsync(team, maxScore, maxBonus, cancellationToken);
            team.KrkCached = krk;
            team.KrkCachedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<double> CalculateAsync(Team team, int maxScore, int maxBonus, CancellationToken cancellationToken)
    {
        var baseNormalized = maxScore > 0
            ? Math.Clamp((double)team.Score / maxScore * 10d, 0d, 10d)
            : 0d;

        var votes = await _dbContext.Votes.AsNoTracking()
            .Where(v => v.TeamId == team.Id)
            .Select(v => v.Score)
            .ToListAsync(cancellationToken);

        double cohesionNormalized = 0d;
        if (votes.Count > 0)
        {
            var averageOnFiveScale = votes.Average();
            // 1..5 -> 0..10
            cohesionNormalized = Math.Clamp((averageOnFiveScale - 1d) / 4d * 10d, 0d, 10d);
        }

        var bonus = await _dbContext.TeamChallengeProgresses.AsNoTracking()
            .Where(p => p.TeamId == team.Id && p.Status == ChallengeProgressStatuses.Approved)
            .Join(_dbContext.Challenges.AsNoTracking(), p => p.ChallengeId, c => c.Id, (p, c) => c.BonusPoints)
            .SumAsync(cancellationToken);

        var challengeNormalized = maxBonus > 0
            ? Math.Clamp((double)bonus / maxBonus * 10d, 0d, 10d)
            : 0d;

        var krk = baseNormalized * BaseWeight + cohesionNormalized * CohesionWeight + challengeNormalized * ChallengeWeight;
        return Math.Round(Math.Clamp(krk, 0d, 10d), 1);
    }
}
