namespace TeamExamProject.Contracts.Challenges;

/// <summary>
/// Челлендж платформы с информацией о статусе участия команды текущего пользователя.
/// </summary>
public class ChallengeResponse
{
    /// <summary>Уникальный идентификатор челленджа.</summary>
    public int Id { get; set; }

    /// <summary>Название челленджа.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Описание условий и целей челленджа.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Количество бонусных очков за успешное выполнение.</summary>
    public int BonusPoints { get; set; }

    /// <summary>Признак активности челленджа; неактивные челленджи недоступны для подачи.</summary>
    public bool IsActive { get; set; }

    /// <summary>Дата и время начала челленджа в UTC; <c>null</c>, если ограничение не задано.</summary>
    public DateTime? StartsAtUtc { get; set; }

    /// <summary>Дата и время окончания челленджа в UTC; <c>null</c>, если ограничение не задано.</summary>
    public DateTime? EndsAtUtc { get; set; }

    /// <summary>Текущий статус команды-владельца запроса (если есть): Submitted | Approved | Rejected | null.</summary>
    public string? TeamStatus { get; set; }

    /// <summary>Количество команд, чьи заявки на выполнение челленджа одобрены.</summary>
    public int ApprovedTeamsCount { get; set; }
}

/// <summary>
/// Заявка команды на выполнение челленджа с результатами модерации.
/// </summary>
public class ChallengeProgressResponse
{
    /// <summary>Уникальный идентификатор заявки на выполнение.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор челленджа.</summary>
    public int ChallengeId { get; set; }

    /// <summary>Название челленджа для отображения.</summary>
    public string ChallengeTitle { get; set; } = string.Empty;

    /// <summary>Идентификатор команды, подавшей заявку.</summary>
    public int TeamId { get; set; }

    /// <summary>Название команды, подавшей заявку.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Идентификатор пользователя, отправившего заявку.</summary>
    public int SubmittedByUserId { get; set; }

    /// <summary>Имя пользователя, отправившего заявку.</summary>
    public string SubmittedByUserName { get; set; } = string.Empty;

    /// <summary>Текст доказательства выполнения челленджа.</summary>
    public string ProofText { get; set; } = string.Empty;

    /// <summary>Текущий статус заявки (Submitted, Approved, Rejected).</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Количество бонусных очков, начисленных или ожидаемых за выполнение.</summary>
    public int BonusPoints { get; set; }

    /// <summary>Дата и время подачи заявки в UTC.</summary>
    public DateTime SubmittedAtUtc { get; set; }

    /// <summary>Дата и время проверки заявки модератором в UTC; <c>null</c>, если проверка не проводилась.</summary>
    public DateTime? ReviewedAtUtc { get; set; }
}
