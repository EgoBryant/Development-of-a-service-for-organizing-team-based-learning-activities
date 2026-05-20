namespace TeamExamProject.Contracts.Challenges;

public class ChallengeResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int BonusPoints { get; set; }
    public bool IsActive { get; set; }
    public DateTime? StartsAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
    /// <summary>Текущий статус команды-владельца запроса (если есть): Submitted | Approved | Rejected | null.</summary>
    public string? TeamStatus { get; set; }
    public int ApprovedTeamsCount { get; set; }
}

public class ChallengeProgressResponse
{
    public int Id { get; set; }
    public int ChallengeId { get; set; }
    public string ChallengeTitle { get; set; } = string.Empty;
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int SubmittedByUserId { get; set; }
    public string SubmittedByUserName { get; set; } = string.Empty;
    public string ProofText { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int BonusPoints { get; set; }
    public DateTime SubmittedAtUtc { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
}
