namespace TeamExamProject.Models;

public class CheckIn
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public Team? Team { get; set; }
    public int WeekNumber { get; set; }
    public string ReportText { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
