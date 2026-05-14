using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Votes;
using TeamExamProject.Data;
using TeamExamProject.Models;

namespace TeamExamProject.Services;

public class VotesService : IVotesService
{
    private readonly AppDbContext _dbContext;

    public VotesService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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

        var duplicateExists = await _dbContext.Votes.AnyAsync(vote =>
            vote.TeamId == fromUser.TeamId.Value &&
            vote.FromUserId == fromUser.Id &&
            vote.ToUserId == toUser.Id, cancellationToken);

        if (duplicateExists)
        {
            return new VoteCreateResult { Type = VoteCreateResultType.DuplicateVote };
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

        return new VoteCreateResult
        {
            Type = VoteCreateResultType.Created,
            Vote = await _dbContext.Votes
                .AsNoTracking()
                .Include(existingVote => existingVote.FromUser)
                .Include(existingVote => existingVote.ToUser)
                .Where(existingVote => existingVote.Id == vote.Id)
                .Select(existingVote => Map(existingVote))
                .SingleAsync(cancellationToken)
        };
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
