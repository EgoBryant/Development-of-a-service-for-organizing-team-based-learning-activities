namespace TeamExamProject.Models;

public class HelpRequest
{
    public int Id { get; set; }
    public int FromTeamId { get; set; }
    public Team? FromTeam { get; set; }
    /// <summary>Целевая команда. В MVP nullable=false (нельзя создавать «всем»).</summary>
    public int ToTeamId { get; set; }
    public Team? ToTeam { get; set; }
    /// <summary>Заголовок/тема запроса (UI: «topic»).</summary>
    public string Topic { get; set; } = string.Empty;
    /// <summary>Тег/направление (UI: «tag»: «Java», «Матан», ...).</summary>
    public string Tag { get; set; } = string.Empty;
    /// <summary>Развёрнутое описание потребности.</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>Формат встречи (UI: «format»: «онлайн», «оффлайн», «гибрид», ...).</summary>
    public string Format { get; set; } = string.Empty;
    /// <summary>Планируемое время начала помощи (UI: «dateTime»).</summary>
    public DateTime? ScheduledAtUtc { get; set; }
    /// <summary>Лига, если ограничение применимо (UI: «league» в team rescue).</summary>
    public string LeagueLabel { get; set; } = string.Empty;
    public string Status { get; set; } = HelpRequestStatuses.Open;
    public double BonusPoints { get; set; }
    /// <summary>Флаг, что бонус уже начислён принимающей команде (защита от двойного начисления).</summary>
    public bool BonusAwarded { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
