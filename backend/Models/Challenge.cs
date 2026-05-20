namespace TeamExamProject.Models;

/// <summary>Челлендж — задание для команд из 5–10 пунктов MVP.</summary>
public class Challenge
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    /// <summary>Награда в баллах при подтверждении выполнения.</summary>
    public int BonusPoints { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartsAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
    public int? InstituteId { get; set; }
    public int? GameSeasonId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<TeamChallengeProgress> Progress { get; set; } = new List<TeamChallengeProgress>();
}

public static class ChallengeProgressStatuses
{
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
}

public class TeamChallengeProgress
{
    public int Id { get; set; }
    public int ChallengeId { get; set; }
    public Challenge? Challenge { get; set; }
    public int TeamId { get; set; }
    public Team? Team { get; set; }
    public int SubmittedByUserId { get; set; }
    public User? SubmittedByUser { get; set; }
    public string ProofText { get; set; } = string.Empty;
    public string Status { get; set; } = ChallengeProgressStatuses.Submitted;
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAtUtc { get; set; }
}
