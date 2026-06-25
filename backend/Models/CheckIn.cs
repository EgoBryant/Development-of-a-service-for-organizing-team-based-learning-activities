namespace TeamExamProject.Models;

/// <summary>Еженедельный отчёт команды (check-in).</summary>
public class CheckIn
{
    /// <summary>Уникальный идентификатор отчёта.</summary>
    public int Id { get; set; }
    /// <summary>Идентификатор команды.</summary>
    public int TeamId { get; set; }
    /// <summary>Навигация к команде, сдавшей отчёт.</summary>
    public Team? Team { get; set; }
    /// <summary>Номер игровой недели.</summary>
    public int WeekNumber { get; set; }
    /// <summary>Текст отчёта.</summary>
    public string ReportText { get; set; } = string.Empty;
    /// <summary>Статус отчёта: Draft | Submitted | Approved | Rejected.</summary>
    public string Status { get; set; } = CheckInStatuses.Submitted;
    /// <summary>Дата и время сдачи отчёта (UTC).</summary>
    public DateTime? SubmittedAtUtc { get; set; }
    /// <summary>Дата и время создания записи (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

/// <summary>Допустимые статусы еженедельного отчёта.</summary>
public static class CheckInStatuses
{
    /// <summary>Черновик, ещё не отправлен.</summary>
    public const string Draft = "Draft";
    /// <summary>Отправлен на проверку.</summary>
    public const string Submitted = "Submitted";
    /// <summary>Одобрен модератором.</summary>
    public const string Approved = "Approved";
    /// <summary>Отклонён модератором.</summary>
    public const string Rejected = "Rejected";
}
