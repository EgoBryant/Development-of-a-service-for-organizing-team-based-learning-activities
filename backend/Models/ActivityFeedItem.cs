namespace TeamExamProject.Models;

/// <summary>Запись в общей ленте активности (агрегатор игровых событий: голос, помощь, челлендж, ачивка...).</summary>
public class ActivityFeedItem
{
    public int Id { get; set; }
    /// <summary>Тип события (см. <see cref="ActivityFeedItemTypes"/>).</summary>
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? TeamId { get; set; }
    public Team? Team { get; set; }
    public int? UserId { get; set; }
    public User? User { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public static class ActivityFeedItemTypes
{
    public const string TeamCreated = "TEAM_CREATED";
    public const string TeamJoined = "TEAM_JOINED";
    public const string CheckIn = "CHECKIN";
    public const string Vote = "VOTE";
    public const string HelpRequestCreated = "HELP_CREATED";
    public const string HelpRequestCompleted = "HELP_COMPLETED";
    public const string ChallengeSubmitted = "CHALLENGE_SUBMITTED";
    public const string ChallengeApproved = "CHALLENGE_APPROVED";
    public const string AchievementEarned = "ACHIEVEMENT_EARNED";
    public const string KnowledgePostCreated = "KNOWLEDGE_POST_CREATED";
    public const string EventCreated = "EVENT_CREATED";
}
