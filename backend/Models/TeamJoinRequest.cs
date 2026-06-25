namespace TeamExamProject.Models;

/// <summary>Заявка пользователя на вступление в команду.</summary>
public class TeamJoinRequest
{
    /// <summary>Уникальный идентификатор заявки.</summary>
    public int Id { get; set; }
    /// <summary>Идентификатор целевой команды.</summary>
    public int TeamId { get; set; }
    /// <summary>Навигация к команде, в которую подана заявка.</summary>
    public Team? Team { get; set; }
    /// <summary>Идентификатор пользователя-заявителя.</summary>
    public int UserId { get; set; }
    /// <summary>Навигация к пользователю, подавшему заявку.</summary>
    public User? User { get; set; }
    /// <summary>Сопроводительное сообщение заявителя.</summary>
    public string Message { get; set; } = string.Empty;
    /// <summary>Текущий статус заявки (см. <see cref="TeamJoinRequestStatuses"/>).</summary>
    public string Status { get; set; } = TeamJoinRequestStatuses.Pending;
    /// <summary>Дата и время создания заявки (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    /// <summary>Дата и время принятия решения по заявке (UTC).</summary>
    public DateTime? DecidedAtUtc { get; set; }
    /// <summary>Идентификатор пользователя, принявшего решение.</summary>
    public int? DecidedByUserId { get; set; }
    /// <summary>Навигация к пользователю (капитану/админу), принявшему решение.</summary>
    public User? DecidedByUser { get; set; }
}

/// <summary>Допустимые статусы заявки на вступление в команду.</summary>
public static class TeamJoinRequestStatuses
{
    /// <summary>Заявка ожидает рассмотрения.</summary>
    public const string Pending = "Pending";
    /// <summary>Заявка принята.</summary>
    public const string Accepted = "Accepted";
    /// <summary>Заявка отклонена.</summary>
    public const string Rejected = "Rejected";
    /// <summary>Заявка отменена заявителем.</summary>
    public const string Cancelled = "Cancelled";
}
