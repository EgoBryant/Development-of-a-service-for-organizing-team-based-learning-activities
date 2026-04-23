namespace TeamExamProject.Contracts.CheckIns;

public class CheckInResponse
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public string ReportText { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
