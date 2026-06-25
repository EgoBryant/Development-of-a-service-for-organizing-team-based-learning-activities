namespace TeamExamProject.Models;

/// <summary>Событие игрового календаря (встреча команды или общеигровое событие).</summary>
public class CalendarEvent
{
    /// <summary>Уникальный идентификатор события.</summary>
    public int Id { get; set; }
    /// <summary>Тема встречи или мероприятия.</summary>
    public string Topic { get; set; } = string.Empty;
    /// <summary>Тег или направление события.</summary>
    public string Tag { get; set; } = string.Empty;
    /// <summary>Подробное описание.</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>Формат: онлайн / оффлайн / гибрид.</summary>
    public string Format { get; set; } = string.Empty;
    /// <summary>Дата и время начала (UTC).</summary>
    public DateTime StartsAtUtc { get; set; }
    /// <summary>true — событие видно всем игрокам; false — только участникам конкретной команды.</summary>
    public bool IsGlobal { get; set; }
    /// <summary>Идентификатор команды (для командных событий).</summary>
    public int? TeamId { get; set; }
    /// <summary>Навигация к команде-организатору (для неглобальных событий).</summary>
    public Team? Team { get; set; }
    /// <summary>Идентификатор пользователя-создателя.</summary>
    public int CreatedByUserId { get; set; }
    /// <summary>Навигация к пользователю, создавшему событие.</summary>
    public User? CreatedByUser { get; set; }
    /// <summary>SaaS-расширение: идентификатор института.</summary>
    public int? InstituteId { get; set; }
    /// <summary>SaaS-расширение: идентификатор игрового сезона.</summary>
    public int? GameSeasonId { get; set; }
    /// <summary>Дата и время создания записи (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
