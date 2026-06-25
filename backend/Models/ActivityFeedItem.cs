namespace TeamExamProject.Models;

/// <summary>Запись в общей ленте активности (агрегатор игровых событий: голос, помощь, челлендж, ачивка...).</summary>
public class ActivityFeedItem
{
    /// <summary>Уникальный идентификатор записи.</summary>
    public int Id { get; set; }
    /// <summary>Тип события (см. <see cref="ActivityFeedItemTypes"/>).</summary>
    public string Type { get; set; } = string.Empty;
    /// <summary>Текстовое описание события для ленты.</summary>
    public string Message { get; set; } = string.Empty;
    /// <summary>Идентификатор связанной команды (если применимо).</summary>
    public int? TeamId { get; set; }
    /// <summary>Навигация к команде, к которой относится событие.</summary>
    public Team? Team { get; set; }
    /// <summary>Идентификатор связанного пользователя (если применимо).</summary>
    public int? UserId { get; set; }
    /// <summary>Навигация к пользователю, инициировавшему событие.</summary>
    public User? User { get; set; }
    /// <summary>Дата и время события (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

/// <summary>Машинные коды типов событий ленты активности.</summary>
public static class ActivityFeedItemTypes
{
    /// <summary>Команда создана.</summary>
    public const string TeamCreated = "TEAM_CREATED";
    /// <summary>Пользователь вступил в команду.</summary>
    public const string TeamJoined = "TEAM_JOINED";
    /// <summary>Создана заявка на вступление в команду.</summary>
    public const string TeamJoinRequestCreated = "TEAM_JOIN_REQUEST_CREATED";
    /// <summary>Заявка на вступление принята.</summary>
    public const string TeamJoinRequestAccepted = "TEAM_JOIN_REQUEST_ACCEPTED";
    /// <summary>Заявка на вступление отклонена.</summary>
    public const string TeamJoinRequestRejected = "TEAM_JOIN_REQUEST_REJECTED";
    /// <summary>Команда обновлена (например, переименована).</summary>
    public const string TeamUpdated = "TEAM_UPDATED";
    /// <summary>Сдан еженедельный check-in.</summary>
    public const string CheckIn = "CHECKIN";
    /// <summary>Проголосовали за участника команды.</summary>
    public const string Vote = "VOTE";
    /// <summary>Создан запрос на помощь.</summary>
    public const string HelpRequestCreated = "HELP_CREATED";
    /// <summary>Запрос на помощь завершён.</summary>
    public const string HelpRequestCompleted = "HELP_COMPLETED";
    /// <summary>Челлендж сдан на проверку.</summary>
    public const string ChallengeSubmitted = "CHALLENGE_SUBMITTED";
    /// <summary>Челлендж одобрен.</summary>
    public const string ChallengeApproved = "CHALLENGE_APPROVED";
    /// <summary>Получено достижение.</summary>
    public const string AchievementEarned = "ACHIEVEMENT_EARNED";
    /// <summary>Опубликовано объявление на бирже знаний.</summary>
    public const string KnowledgePostCreated = "KNOWLEDGE_POST_CREATED";
    /// <summary>Создано событие календаря.</summary>
    public const string EventCreated = "EVENT_CREATED";
}
