namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Полное представление команды, возвращаемое API списка и детализации команд.
/// </summary>
public class TeamResponse
{
    /// <summary>Уникальный идентификатор команды.</summary>
    public int Id { get; set; }

    /// <summary>Название команды.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Описание команды.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Код приглашения для вступления в команду.</summary>
    public string InviteCode { get; set; } = string.Empty;

    /// <summary>Идентификатор капитана команды; <c>null</c>, если капитан не назначен.</summary>
    public int? CaptainId { get; set; }

    /// <summary>Текущий суммарный счёт команды.</summary>
    public int Score { get; set; }

    /// <summary>Последний рассчитанный КРК (0–10, 1 знак после запятой).</summary>
    public double Krk { get; set; }

    /// <summary>Имя капитана команды для отображения.</summary>
    public string CaptainUserName { get; set; } = string.Empty;

    /// <summary>Дата и время создания команды.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Количество участников в команде.</summary>
    public int MemberCount { get; set; }

    /// <summary>Список участников команды с детальными данными.</summary>
    public List<TeamMemberResponse> Members { get; set; } = new();
}
