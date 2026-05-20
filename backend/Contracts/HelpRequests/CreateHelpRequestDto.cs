using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.HelpRequests;

/// <summary>
/// Тело создания «спасения». Совмещает фронтовые <c>RescueDraft</c> и <c>TeamRescueDraft</c>.
/// </summary>
public class CreateHelpRequestDto
{
    [Range(1, int.MaxValue)]
    public int ToTeamId { get; set; }

    [MaxLength(200)]
    public string Topic { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Tag { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Format { get; set; } = string.Empty;

    /// <summary>UTC время планируемой встречи. Если фронт шлёт <c>dateTime</c> в локальной зоне — конвертируйте на фронте.</summary>
    public DateTime? ScheduledAtUtc { get; set; }

    [MaxLength(50)]
    public string LeagueLabel { get; set; } = string.Empty;

    [Range(0, 1000)]
    public double BonusPoints { get; set; }
}
