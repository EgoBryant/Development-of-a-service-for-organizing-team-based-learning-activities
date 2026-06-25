using Microsoft.EntityFrameworkCore;
using TeamExamProject.Data;

namespace TeamExamProject.Services;

/// <summary>
/// Командный счёт = сумма <c>UserPoints</c> всех участников команды.
/// </summary>
public class TeamScoreService : ITeamScoreService
{
    private readonly AppDbContext _dbContext;
    private readonly IKrkCalculationService _krkCalculationService;

    public TeamScoreService(AppDbContext dbContext, IKrkCalculationService krkCalculationService)
    {
        _dbContext = dbContext;
        _krkCalculationService = krkCalculationService;
    }

    /// <inheritdoc />
    public async Task<int?> RecalculateTeamScoreAsync(
        int teamId,
        bool recalculateKrk = true,
        CancellationToken cancellationToken = default)
    {
        var team = await _dbContext.Teams
            .SingleOrDefaultAsync(existing => existing.Id == teamId, cancellationToken);
        if (team is null)
        {
            return null;
        }

        var totalScore = await _dbContext.Users
            .Where(user => user.TeamId == teamId)
            .SumAsync(user => user.UserPoints, cancellationToken);

        team.Score = totalScore;
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (recalculateKrk)
        {
            await _krkCalculationService.RecalculateForTeamAsync(teamId, cancellationToken);
        }

        return totalScore;
    }

    /// <inheritdoc />
    public async Task RecalculateForUserTeamAsync(
        int userId,
        bool recalculateKrk = true,
        CancellationToken cancellationToken = default)
    {
        var teamId = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.TeamId)
            .SingleOrDefaultAsync(cancellationToken);

        if (teamId is null)
        {
            return;
        }

        await RecalculateTeamScoreAsync(teamId.Value, recalculateKrk, cancellationToken);
    }

    /// <inheritdoc />
    public async Task RecalculateAllTeamScoresAsync(
        bool recalculateKrk = true,
        CancellationToken cancellationToken = default)
    {
        var teamIds = await _dbContext.Teams
            .AsNoTracking()
            .Select(team => team.Id)
            .ToListAsync(cancellationToken);

        foreach (var teamId in teamIds)
        {
            await RecalculateTeamScoreAsync(teamId, recalculateKrk: false, cancellationToken);
        }

        if (recalculateKrk && teamIds.Count > 0)
        {
            await _krkCalculationService.RecalculateAllAsync(cancellationToken);
        }
    }
}
