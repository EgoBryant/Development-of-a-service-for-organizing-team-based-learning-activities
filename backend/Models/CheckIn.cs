namespace TeamExamProject.Models;

public class CheckIn
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public Team? Team { get; set; }
    public int WeekNumber { get; set; }
    public string ReportText { get; set; } = string.Empty;
    /// <summary>Статус отчёта: Draft | Submitted | Approved | Rejected.</summary>
    public string Status { get; set; } = CheckInStatuses.Submitted;
    public DateTime? SubmittedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public static class CheckInStatuses
{
    public const string Draft = "Draft";
    public const string Submitted = "Submitted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
}
