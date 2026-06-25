namespace TeamExamProject.Models;

/// <summary>Анонимный голос участника за вклад тиммейта в команде.</summary>
public class Vote
{
    /// <summary>Уникальный идентификатор голоса.</summary>
    public int Id { get; set; }
    /// <summary>Идентификатор команды, внутри которой проголосовали.</summary>
    public int TeamId { get; set; }
    /// <summary>Навигация к команде.</summary>
    public Team? Team { get; set; }
    /// <summary>Идентификатор голосующего пользователя.</summary>
    public int FromUserId { get; set; }
    /// <summary>Навигация к пользователю, отдавшему голос.</summary>
    public User? FromUser { get; set; }
    /// <summary>Идентификатор пользователя, за которого проголосовали.</summary>
    public int ToUserId { get; set; }
    /// <summary>Навигация к пользователю, получившему оценку.</summary>
    public User? ToUser { get; set; }
    /// <summary>Оценка вклада по 5-балльной шкале.</summary>
    public int Score { get; set; }
    /// <summary>Дата и время голосования (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
