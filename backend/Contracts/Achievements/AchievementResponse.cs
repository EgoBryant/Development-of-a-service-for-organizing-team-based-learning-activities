namespace TeamExamProject.Contracts.Achievements;

/// <summary>
/// Справочная информация о достижении платформы.
/// </summary>
public class AchievementResponse
{
    /// <summary>Уникальный идентификатор достижения.</summary>
    public int Id { get; set; }

    /// <summary>Уникальный код достижения для программной идентификации.</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Название достижения для отображения.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Описание условий получения достижения.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>URL иконки достижения.</summary>
    public string IconUrl { get; set; } = string.Empty;
}

/// <summary>
/// Достижение, полученное конкретным пользователем.
/// </summary>
public class UserAchievementResponse
{
    /// <summary>Уникальный идентификатор записи о получении достижения.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор пользователя, получившего достижение.</summary>
    public int UserId { get; set; }

    /// <summary>Идентификатор достижения.</summary>
    public int AchievementId { get; set; }

    /// <summary>Уникальный код достижения.</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Название достижения для отображения.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Описание условий получения достижения.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>URL иконки достижения.</summary>
    public string IconUrl { get; set; } = string.Empty;

    /// <summary>Дата и время получения достижения в UTC.</summary>
    public DateTime EarnedAtUtc { get; set; }
}
