using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Votes;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class VotesService : IVotesService
{
    private readonly AppDbContext _dbContext;
    private readonly IKrkCalculationService _krkCalculationService;

    public VotesService(
        AppDbContext dbContext,
        IKrkCalculationService krkCalculationService)
    {
        _dbContext = dbContext;
        _krkCalculationService = krkCalculationService;
    }

    public async Task<IReadOnlyCollection<VoteResponse>> GetForCurrentTeamAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user?.TeamId is null)
        {
            return Array.Empty<VoteResponse>();
        }

        var votes = await _dbContext.Votes
            .AsNoTracking()
            .Include(vote => vote.FromUser)
            .Include(vote => vote.ToUser)
            .Where(vote => vote.TeamId == user.TeamId.Value)
            .OrderByDescending(vote => vote.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return votes.Select(Map).ToList();
    }

    public async Task<IReadOnlyCollection<MyVoteResponse>> GetMyVotesAsync(int userId, CancellationToken cancellationToken = default)
    {
        var votes = await _dbContext.Votes
            .AsNoTracking()
            .Include(vote => vote.ToUser)
            .Where(vote => vote.FromUserId == userId)
            .OrderByDescending(vote => vote.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return votes.Select(vote => new MyVoteResponse
        {
            Id = vote.Id,
            ToUserId = vote.ToUserId,
            ToUserName = vote.ToUser?.UserName ?? string.Empty,
            Score = vote.Score,
            CreatedAtUtc = vote.CreatedAtUtc
        }).ToList();
    }

    public async Task<VoteCreateResult> CreateAsync(int userId, CreateVoteDto request, CancellationToken cancellationToken = default)
    {
        var fromUser = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (fromUser is null)
        {
            return new VoteCreateResult { Type = VoteCreateResultType.UserNotFound };
        }

        if (fromUser.TeamId is null)
        {
            return new VoteCreateResult { Type = VoteCreateResultType.UserHasNoTeam };
        }

        if (fromUser.Id == request.ToUserId)
        {
            return new VoteCreateResult { Type = VoteCreateResultType.SelfVote };
        }

        var toUser = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == request.ToUserId, cancellationToken);
        if (toUser is null)
        {
            return new VoteCreateResult { Type = VoteCreateResultType.TargetUserNotFound };
        }

        if (toUser.TeamId != fromUser.TeamId)
        {
            return new VoteCreateResult { Type = VoteCreateResultType.DifferentTeams };
        }

        var existingVote = await _dbContext.Votes.SingleOrDefaultAsync(vote =>
            vote.TeamId == fromUser.TeamId.Value &&
            vote.FromUserId == fromUser.Id &&
            vote.ToUserId == toUser.Id, cancellationToken);

        if (existingVote is not null)
        {
            existingVote.Score = request.Score;
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _krkCalculationService.RecalculateForTeamAsync(fromUser.TeamId.Value, cancellationToken);

            return new VoteCreateResult
            {
                Type = VoteCreateResultType.Created,
                Vote = await LoadVoteResponseAsync(existingVote.Id, cancellationToken)
            };
        }

        var vote = new Vote
        {
            TeamId = fromUser.TeamId.Value,
            FromUserId = fromUser.Id,
            ToUserId = toUser.Id,
            Score = request.Score,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Votes.Add(vote);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _krkCalculationService.RecalculateForTeamAsync(fromUser.TeamId.Value, cancellationToken);

        return new VoteCreateResult
        {
            Type = VoteCreateResultType.Created,
            Vote = await LoadVoteResponseAsync(vote.Id, cancellationToken)
        };
    }

    public async Task<VoteUpdateResult> UpdateAsync(int userId, CreateVoteDto request, CancellationToken cancellationToken = default)
    {
        var fromUser = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (fromUser is null)
        {
            return new VoteUpdateResult { Type = VoteUpdateResultType.UserNotFound };
        }

        if (fromUser.TeamId is null)
        {
            return new VoteUpdateResult { Type = VoteUpdateResultType.UserHasNoTeam };
        }

        var toUser = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == request.ToUserId, cancellationToken);
        if (toUser is null)
        {
            return new VoteUpdateResult { Type = VoteUpdateResultType.TargetUserNotFound };
        }

        if (toUser.TeamId != fromUser.TeamId)
        {
            return new VoteUpdateResult { Type = VoteUpdateResultType.DifferentTeams };
        }

        var vote = await _dbContext.Votes.SingleOrDefaultAsync(existingVote =>
            existingVote.TeamId == fromUser.TeamId.Value &&
            existingVote.FromUserId == fromUser.Id &&
            existingVote.ToUserId == toUser.Id, cancellationToken);

        if (vote is null)
        {
            return new VoteUpdateResult { Type = VoteUpdateResultType.VoteNotFound };
        }

        vote.Score = request.Score;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _krkCalculationService.RecalculateForTeamAsync(fromUser.TeamId.Value, cancellationToken);

        return new VoteUpdateResult
        {
            Type = VoteUpdateResultType.Updated,
            Vote = await LoadVoteResponseAsync(vote.Id, cancellationToken)
        };
    }

    private async Task<VoteResponse> LoadVoteResponseAsync(int voteId, CancellationToken cancellationToken)
    {
        return await _dbContext.Votes
            .AsNoTracking()
            .Include(vote => vote.FromUser)
            .Include(vote => vote.ToUser)
            .Where(vote => vote.Id == voteId)
            .Select(vote => Map(vote))
            .SingleAsync(cancellationToken);
    }

    private static VoteResponse Map(Vote vote)
    {
        return new VoteResponse
        {
            Id = vote.Id,
            TeamId = vote.TeamId,
            FromUserId = vote.FromUserId,
            FromUserName = vote.FromUser?.UserName ?? string.Empty,
            ToUserId = vote.ToUserId,
            ToUserName = vote.ToUser?.UserName ?? string.Empty,
            Score = vote.Score,
            CreatedAtUtc = vote.CreatedAtUtc
        };
    }
}
