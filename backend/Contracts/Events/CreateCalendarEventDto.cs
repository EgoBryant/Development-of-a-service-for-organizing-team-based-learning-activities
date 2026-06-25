using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Events;

/// <summary>
/// Тело для <c>POST /api/events</c>. Соответствует фронтовому <c>EventCreateDraft</c>/<c>TeamEventCreateDraft</c>:
/// <c>topic, tag, description, format, dateTime</c>. На фронте <c>dateTime</c> = <see cref="StartsAtUtc"/> в ISO.
/// </summary>
public class CreateCalendarEventDto
{
    /// <summary>Тема или название события.</summary>
    [Required]
    [MaxLength(200)]
    public string Topic { get; set; } = string.Empty;

    /// <summary>Тег или категория события (например, предмет или формат).</summary>
    [MaxLength(100)]
    public string Tag { get; set; } = string.Empty;

    /// <summary>Подробное описание события.</summary>
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    /// <summary>Формат проведения (онлайн, офлайн, гибрид и т.п.).</summary>
    [MaxLength(50)]
    public string Format { get; set; } = string.Empty;

    /// <summary>Дата и время начала события в UTC.</summary>
    public DateTime StartsAtUtc { get; set; }

    /// <summary>true — событие видно всем; false — только участникам команды текущего пользователя.</summary>
    public bool IsGlobal { get; set; }
}

/// <summary>
/// Параметры фильтрации календарных событий для API <c>GET /api/events</c>.
/// </summary>
public class CalendarEventQuery
{
    /// <summary>Начало временного диапазона выборки (UTC); <c>null</c> — без нижней границы.</summary>
    public DateTime? From { get; set; }

    /// <summary>Конец временного диапазона выборки (UTC); <c>null</c> — без верхней границы.</summary>
    public DateTime? To { get; set; }

    /// <summary>all | mine. По умолчанию all (глобальные + командные текущего пользователя).</summary>
    public string? Scope { get; set; }
}
