namespace TeamExamProject.Models;

/// <summary>Запрос на помощь между командами («спасение»).</summary>
public class HelpRequest
{
    /// <summary>Уникальный идентификатор запроса.</summary>
    public int Id { get; set; }
    /// <summary>Идентификатор команды-инициатора.</summary>
    public int FromTeamId { get; set; }
    /// <summary>Навигация к команде, запросившей помощь.</summary>
    public Team? FromTeam { get; set; }
    /// <summary>Целевая команда. В MVP nullable=false (нельзя создавать «всем»).</summary>
    public int ToTeamId { get; set; }
    /// <summary>Навигация к команде, которой адресован запрос.</summary>
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
    /// <summary>Текущий статус запроса (см. <see cref="HelpRequestStatuses"/>).</summary>
    public string Status { get; set; } = HelpRequestStatuses.Open;
    /// <summary>Размер бонусных баллов за оказание помощи.</summary>
    public double BonusPoints { get; set; }
    /// <summary>Флаг, что бонус уже начислён принимающей команде (защита от двойного начисления).</summary>
    public bool BonusAwarded { get; set; }
    /// <summary>Дата и время создания запроса (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
