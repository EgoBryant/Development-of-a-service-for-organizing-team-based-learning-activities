namespace TeamExamProject.Models;

/// <summary>Каталог ачивок.</summary>
public class Achievement
{
    public int Id { get; set; }
    /// <summary>Машинный код ачивки (например, FIRST_CHECKIN, FIRST_RESCUE, TOP3_TEAM).</summary>
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<UserAchievement> Holders { get; set; } = new List<UserAchievement>();
}

public class UserAchievement
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public int AchievementId { get; set; }
    public Achievement? Achievement { get; set; }
    public DateTime EarnedAtUtc { get; set; } = DateTime.UtcNow;
}

public static class AchievementCodes
{
    public const string FirstCheckIn = "FIRST_CHECKIN";
    public const string FirstRescue = "FIRST_RESCUE";
    public const string Top3Team = "TOP3_TEAM";
    public const string FirstVote = "FIRST_VOTE";
    public const string FirstChallenge = "FIRST_CHALLENGE";
}
