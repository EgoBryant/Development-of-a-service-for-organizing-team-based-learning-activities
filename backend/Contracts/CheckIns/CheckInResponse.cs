namespace TeamExamProject.Contracts.CheckIns;

/// <summary>
/// Еженедельный чек-ин команды, возвращаемый API списка и детализации отчётов.
/// </summary>
public class CheckInResponse
{
    /// <summary>Уникальный идентификатор чек-ина.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор команды, сдавшей отчёт.</summary>
    public int TeamId { get; set; }

    /// <summary>Название команды, сдавшей отчёт.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Номер учебной недели (1–52).</summary>
    public int WeekNumber { get; set; }

    /// <summary>Текст еженедельного отчёта команды.</summary>
    public string ReportText { get; set; } = string.Empty;

    /// <summary>Draft | Submitted | Approved | Rejected.</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Дата и время отправки отчёта на проверку в UTC; <c>null</c> для черновиков.</summary>
    public DateTime? SubmittedAtUtc { get; set; }

    /// <summary>Дата и время создания записи чек-ина в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }
}
