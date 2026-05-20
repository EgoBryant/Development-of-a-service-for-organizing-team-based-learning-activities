using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Events;

/// <summary>
/// Тело для <c>POST /api/events</c>. Соответствует фронтовому <c>EventCreateDraft</c>/<c>TeamEventCreateDraft</c>:
/// <c>topic, tag, description, format, dateTime</c>. На фронте <c>dateTime</c> = <see cref="StartsAtUtc"/> в ISO.
/// </summary>
public class CreateCalendarEventDto
{
    [Required]
    [MaxLength(200)]
    public string Topic { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Tag { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Format { get; set; } = string.Empty;

    public DateTime StartsAtUtc { get; set; }

    /// <summary>true — событие видно всем; false — только участникам команды текущего пользователя.</summary>
    public bool IsGlobal { get; set; }
}

public class CalendarEventQuery
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    /// <summary>all | mine. По умолчанию all (глобальные + командные текущего пользователя).</summary>
    public string? Scope { get; set; }
}
