namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Заявка на вступление в команду, возвращаемая API списка и детализации заявок.
/// </summary>
public class TeamJoinRequestResponse
{
    /// <summary>Уникальный идентификатор заявки.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор команды, в которую подана заявка.</summary>
    public int TeamId { get; set; }

    /// <summary>Название команды, в которую подана заявка.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Идентификатор пользователя, подавшего заявку.</summary>
    public int UserId { get; set; }

    /// <summary>Логин пользователя, подавшего заявку.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>Отображаемое имя заявителя.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>URL аватара заявителя.</summary>
    public string AvatarUrl { get; set; } = string.Empty;

    /// <summary>Сопроводительное сообщение заявителя.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Текущий статус заявки (например, Pending, Approved, Rejected).</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Дата и время подачи заявки в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>Дата и время принятия решения по заявке в UTC; <c>null</c>, если решение не принято.</summary>
    public DateTime? DecidedAtUtc { get; set; }

    /// <summary>Идентификатор пользователя, принявшего решение; <c>null</c>, если решение не принято.</summary>
    public int? DecidedByUserId { get; set; }

    /// <summary>Имя пользователя, принявшего решение по заявке.</summary>
    public string DecidedByUserName { get; set; } = string.Empty;
}
