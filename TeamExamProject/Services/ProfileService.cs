using Microsoft.EntityFrameworkCore;
using TeamExamProject.Contracts.Auth;
using TeamExamProject.Contracts.Profile;
using TeamExamProject.Data;

namespace TeamExamProject.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _dbContext;

    public ProfileService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserProfileResponse?> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .Include(existingUser => existingUser.Group)
            .SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);

        if (user is null)
        {
            return null;
        }

        return await BuildProfileAsync(user.Id, cancellationToken);
    }

    public async Task<ProfileUpdateResult> UpdateProfileAsync(int userId, UpdateProfileDto request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(existingUser => existingUser.Id == userId, cancellationToken);
        if (user is null)
        {
            return new ProfileUpdateResult { Type = ProfileUpdateResultType.UserNotFound };
        }

        if (request.GroupId is not null)
        {
            var groupExists = await _dbContext.Groups.AnyAsync(group => group.Id == request.GroupId.Value, cancellationToken);
            if (!groupExists)
            {
                return new ProfileUpdateResult { Type = ProfileUpdateResultType.GroupNotFound };
            }
        }

        if (request.StudentTicketNumber is not null)
        {
            var duplicateTicket = await _dbContext.Users.AnyAsync(existingUser =>
                existingUser.Id != userId &&
                existingUser.StudentTicketNumber == request.StudentTicketNumber.Value,
                cancellationToken);

            if (duplicateTicket)
            {
                return new ProfileUpdateResult { Type = ProfileUpdateResultType.StudentTicketAlreadyUsed };
            }
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.MiddleName = request.MiddleName.Trim();
        user.Nickname = request.Nickname.Trim();
        user.Bio = request.Bio.Trim();
        user.AvatarUrl = request.AvatarUrl.Trim();
        user.ContactEmail = request.ContactEmail.Trim().ToLowerInvariant();
        user.TelegramHandle = request.TelegramHandle.Trim();
        user.PhoneNumber = request.PhoneNumber.Trim();
        user.StudentTicketNumber = request.StudentTicketNumber;
        user.GroupId = request.GroupId;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new ProfileUpdateResult
        {
            Type = ProfileUpdateResultType.Updated,
            Profile = await BuildProfileAsync(user.Id, cancellationToken)
        };
    }

    private async Task<UserProfileResponse> BuildProfileAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .Include(existingUser => existingUser.Group)
            .SingleAsync(existingUser => existingUser.Id == userId, cancellationToken);

        var team = user.TeamId is null
            ? null
            : await _dbContext.Teams
                .AsNoTracking()
                .SingleOrDefaultAsync(existingTeam => existingTeam.Id == user.TeamId.Value, cancellationToken);

        return new UserProfileResponse
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            FirstName = user.FirstName,
            LastName = user.LastName,
            MiddleName = user.MiddleName,
            Nickname = user.Nickname,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            ContactEmail = user.ContactEmail,
            TelegramHandle = user.TelegramHandle,
            PhoneNumber = user.PhoneNumber,
            StudentTicketNumber = user.StudentTicketNumber,
            GroupId = user.GroupId,
            GroupTitle = user.Group?.Title ?? string.Empty,
            TeamId = team?.Id,
            TeamName = team?.Name ?? string.Empty,
            TeamInviteCode = team?.InviteCode ?? string.Empty,
            IsCaptain = team?.CaptainId == user.Id,
            TeamScore = team?.Score ?? 0
        };
    }
}
