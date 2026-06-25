namespace TeamExamProject.Contracts.Events;

/// <summary>
/// Календарное событие, возвращаемое API списка и детализации событий.
/// </summary>
public class CalendarEventResponse
{
    /// <summary>Уникальный идентификатор события.</summary>
    public int Id { get; set; }

    /// <summary>Тема или название события.</summary>
    public string Topic { get; set; } = string.Empty;

    /// <summary>Тег или категория события.</summary>
    public string Tag { get; set; } = string.Empty;

    /// <summary>Подробное описание события.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Формат проведения (онлайн, офлайн, гибрид и т.п.).</summary>
    public string Format { get; set; } = string.Empty;

    /// <summary>Дата и время начала события в UTC.</summary>
    public DateTime StartsAtUtc { get; set; }

    /// <summary>Признак глобального события, видимого всем пользователям.</summary>
    public bool IsGlobal { get; set; }

    /// <summary>Идентификатор команды-организатора; <c>null</c> для глобальных событий.</summary>
    public int? TeamId { get; set; }

    /// <summary>Название команды-организатора.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Идентификатор пользователя, создавшего событие.</summary>
    public int CreatedByUserId { get; set; }

    /// <summary>Имя пользователя, создавшего событие.</summary>
    public string CreatedByUserName { get; set; } = string.Empty;

    /// <summary>Дата и время создания записи в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }
}
