using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.CheckIns;

/// <summary>
/// Тело запроса создания или обновления еженедельного чек-ина команды.
/// </summary>
public class CreateCheckInDto
{
    /// <summary>Номер учебной недели, за которую сдаётся отчёт (1–52).</summary>
    [Range(1, 52)]
    public int WeekNumber { get; set; }

    /// <summary>Текст еженедельного отчёта команды.</summary>
    [Required]
    [MaxLength(4000)]
    public string ReportText { get; set; } = string.Empty;
}
