namespace TeamExamProject.Contracts.ActivityFeed;

/// <summary>
/// Элемент ленты активности платформы для отображения последних событий команд и пользователей.
/// </summary>
public class ActivityFeedItemResponse
{
    /// <summary>Уникальный идентификатор записи ленты.</summary>
    public int Id { get; set; }

    /// <summary>Тип события (например, team_join, rescue, check_in).</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Текст сообщения для отображения в ленте.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Идентификатор связанной команды; <c>null</c>, если событие не привязано к команде.</summary>
    public int? TeamId { get; set; }

    /// <summary>Название связанной команды.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Идентификатор связанного пользователя; <c>null</c>, если событие не привязано к пользователю.</summary>
    public int? UserId { get; set; }

    /// <summary>Имя связанного пользователя.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>Дата и время события в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }
}
