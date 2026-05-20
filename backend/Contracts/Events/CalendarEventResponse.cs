namespace TeamExamProject.Contracts.Events;

public class CalendarEventResponse
{
    public int Id { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public DateTime StartsAtUtc { get; set; }
    public bool IsGlobal { get; set; }
    public int? TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
