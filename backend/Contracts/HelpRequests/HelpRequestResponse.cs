namespace TeamExamProject.Contracts.HelpRequests;

/// <summary>
/// Запрос на «спасение» (взаимопомощь между командами), возвращаемый API списка и детализации.
/// </summary>
public class HelpRequestResponse
{
    /// <summary>Уникальный идентификатор запроса.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор команды, инициировавшей запрос помощи.</summary>
    public int FromTeamId { get; set; }

    /// <summary>Название команды, инициировавшей запрос помощи.</summary>
    public string FromTeamName { get; set; } = string.Empty;

    /// <summary>Идентификатор команды, которой адресован запрос.</summary>
    public int ToTeamId { get; set; }

    /// <summary>Название команды, которой адресован запрос.</summary>
    public string ToTeamName { get; set; } = string.Empty;

    /// <summary>Тема запроса на помощь.</summary>
    public string Topic { get; set; } = string.Empty;

    /// <summary>Тег или категория запроса (например, предмет).</summary>
    public string Tag { get; set; } = string.Empty;

    /// <summary>Подробное описание запрашиваемой помощи.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Формат проведения встречи (онлайн, офлайн и т.п.).</summary>
    public string Format { get; set; } = string.Empty;

    /// <summary>Запланированная дата и время встречи в UTC; <c>null</c>, если не назначено.</summary>
    public DateTime? ScheduledAtUtc { get; set; }

    /// <summary>Метка лиги команды-инициатора для фильтрации и отображения.</summary>
    public string LeagueLabel { get; set; } = string.Empty;

    /// <summary>Текущий статус запроса (например, Pending, Accepted, Completed).</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Размер бонусных очков за успешное «спасение».</summary>
    public double BonusPoints { get; set; }

    /// <summary>Признак того, что бонусные очки уже начислены.</summary>
    public bool BonusAwarded { get; set; }

    /// <summary>Дата и время создания запроса в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }
}
