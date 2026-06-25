namespace TeamExamProject.Models;

/// <summary>Челлендж — задание для команд из 5–10 пунктов MVP.</summary>
public class Challenge
{
    /// <summary>Уникальный идентификатор челленджа.</summary>
    public int Id { get; set; }
    /// <summary>Название задания.</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Описание условий выполнения.</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>Награда в баллах при подтверждении выполнения.</summary>
    public int BonusPoints { get; set; }
    /// <summary>Признак активности челленджа (доступен для сдачи).</summary>
    public bool IsActive { get; set; } = true;
    /// <summary>Дата и время начала действия (UTC).</summary>
    public DateTime? StartsAtUtc { get; set; }
    /// <summary>Дата и время окончания действия (UTC).</summary>
    public DateTime? EndsAtUtc { get; set; }
    /// <summary>SaaS-расширение: идентификатор института.</summary>
    public int? InstituteId { get; set; }
    /// <summary>SaaS-расширение: идентификатор игрового сезона.</summary>
    public int? GameSeasonId { get; set; }
    /// <summary>Дата и время создания (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    /// <summary>Прогресс команд по этому челленджу.</summary>
    public ICollection<TeamChallengeProgress> Progress { get; set; } = new List<TeamChallengeProgress>();
}

/// <summary>Допустимые статусы проверки выполнения челленджа.</summary>
public static class ChallengeProgressStatuses
{
    /// <summary>Доказательства сданы, ожидают проверки.</summary>
    public const string Submitted = "Submitted";
    /// <summary>Выполнение подтверждено.</summary>
    public const string Approved = "Approved";
    /// <summary>Выполнение отклонено.</summary>
    public const string Rejected = "Rejected";
}

/// <summary>Прогресс конкретной команды по челленджу.</summary>
public class TeamChallengeProgress
{
    /// <summary>Уникальный идентификатор записи прогресса.</summary>
    public int Id { get; set; }
    /// <summary>Идентификатор челленджа.</summary>
    public int ChallengeId { get; set; }
    /// <summary>Навигация к челленджу.</summary>
    public Challenge? Challenge { get; set; }
    /// <summary>Идентификатор команды.</summary>
    public int TeamId { get; set; }
    /// <summary>Навигация к команде-исполнителю.</summary>
    public Team? Team { get; set; }
    /// <summary>Идентификатор пользователя, сдавшего доказательства.</summary>
    public int SubmittedByUserId { get; set; }
    /// <summary>Навигация к пользователю, отправившему сдачу.</summary>
    public User? SubmittedByUser { get; set; }
    /// <summary>Текст доказательств выполнения.</summary>
    public string ProofText { get; set; } = string.Empty;
    /// <summary>Текущий статус проверки (см. <see cref="ChallengeProgressStatuses"/>).</summary>
    public string Status { get; set; } = ChallengeProgressStatuses.Submitted;
    /// <summary>Дата и время сдачи (UTC).</summary>
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    /// <summary>Дата и время проверки модератором (UTC).</summary>
    public DateTime? ReviewedAtUtc { get; set; }
}
