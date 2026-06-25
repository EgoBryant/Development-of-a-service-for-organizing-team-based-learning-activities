using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Assignments;

/// <summary>Тело создания задания из запроса «Спасение» на вкладке «Команда».</summary>
public class CreateAssignmentDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Tag { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string DeadlineLabel { get; set; } = string.Empty;

    public DateTime? DeadlineUtc { get; set; }

    [Required]
    [MaxLength(20)]
    public string LeagueTier { get; set; } = string.Empty;
}
