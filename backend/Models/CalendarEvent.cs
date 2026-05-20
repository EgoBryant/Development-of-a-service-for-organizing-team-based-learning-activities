namespace TeamExamProject.Models;

/// <summary>Событие игрового календаря (встреча команды или общеигровое событие).</summary>
public class CalendarEvent
{
    public int Id { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    /// <summary>Формат: онлайн / оффлайн / гибрид.</summary>
    public string Format { get; set; } = string.Empty;
    public DateTime StartsAtUtc { get; set; }
    /// <summary>true — событие видно всем игрокам; false — только участникам конкретной команды.</summary>
    public bool IsGlobal { get; set; }
    public int? TeamId { get; set; }
    public Team? Team { get; set; }
    public int CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public int? InstituteId { get; set; }
    public int? GameSeasonId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
