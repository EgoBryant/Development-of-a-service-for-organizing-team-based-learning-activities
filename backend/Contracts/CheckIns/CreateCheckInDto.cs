using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.CheckIns;

public class CreateCheckInDto
{
    [Range(1, 52)]
    public int WeekNumber { get; set; }

    [Required]
    [MaxLength(4000)]
    public string ReportText { get; set; } = string.Empty;
}
