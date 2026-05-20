using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Challenges;

public class CreateChallengeDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 1000)]
    public int BonusPoints { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime? StartsAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
}

public class SubmitChallengeDto
{
    [MaxLength(2000)]
    public string ProofText { get; set; } = string.Empty;
}

public class ReviewChallengeProgressDto
{
    /// <summary>Approved | Rejected.</summary>
    [Required]
    public string Status { get; set; } = string.Empty;
}
