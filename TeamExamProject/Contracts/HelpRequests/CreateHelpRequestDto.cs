using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.HelpRequests;

public class CreateHelpRequestDto
{
    [Range(1, int.MaxValue)]
    public int ToTeamId { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 1000)]
    public double BonusPoints { get; set; }
}
