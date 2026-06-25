using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.HelpRequests;

/// <summary>
/// Тело создания «спасения». Совмещает фронтовые <c>RescueDraft</c> и <c>TeamRescueDraft</c>.
/// </summary>
public class CreateHelpRequestDto
{
    /// <summary>Идентификатор команды, которой адресован запрос на помощь.</summary>
    [Range(1, int.MaxValue)]
    public int ToTeamId { get; set; }

    /// <summary>Тема запроса на помощь.</summary>
    [MaxLength(200)]
    public string Topic { get; set; } = string.Empty;

    /// <summary>Тег или категория запроса (например, предмет).</summary>
    [MaxLength(100)]
    public string Tag { get; set; } = string.Empty;

    /// <summary>Подробное описание запрашиваемой помощи.</summary>
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    /// <summary>Формат проведения встречи (онлайн, офлайн и т.п.).</summary>
    [MaxLength(50)]
    public string Format { get; set; } = string.Empty;

    /// <summary>UTC время планируемой встречи. Если фронт шлёт <c>dateTime</c> в локальной зоне — конвертируйте на фронте.</summary>
    public DateTime? ScheduledAtUtc { get; set; }

    /// <summary>Метка лиги команды-инициатора для фильтрации и отображения.</summary>
    [MaxLength(50)]
    public string LeagueLabel { get; set; } = string.Empty;

    /// <summary>Размер бонусных очков, предлагаемых за успешное «спасение» (от 0 до 1000).</summary>
    [Range(0, 1000)]
    public double BonusPoints { get; set; }
}
