namespace TeamExamProject.Contracts.Ratings;

/// <summary>
/// Соответствует фронтовому <c>RatingUser</c>. <see cref="Id"/> и <see cref="TeamId"/> — строки.
/// </summary>
public class RatingUserResponse
{
    /// <summary>Строковый идентификатор пользователя для совместимости с фронтендом.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Текущее место пользователя в персональном лидерборде.</summary>
    public int Rank { get; set; }

    /// <summary>Отображаемое имя пользователя.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Личные очки пользователя.</summary>
    public int Points { get; set; }

    /// <summary>Средняя оценка вклада по анонимным голосам 1..5.</summary>
    public double Contribution { get; set; }

    /// <summary>Признак того, что пользователь состоит в команде.</summary>
    public bool HasTeam { get; set; }

    /// <summary>Строковый идентификатор команды; <c>null</c>, если команды нет.</summary>
    public string? TeamId { get; set; }

    /// <summary>Название команды пользователя.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Название академической группы пользователя.</summary>
    public string GroupTitle { get; set; } = string.Empty;

    /// <summary>Признак того, что пользователь является капитаном команды.</summary>
    public bool IsCaptain { get; set; }

    /// <summary>Подпись лиги по порогам очков (БАЗОВАЯ / БРОНЗА / СЕРЕБРО / ЗОЛОТО). См. <c>FRONTEND-API-CONTRACT.md</c>.</summary>
    public string League { get; set; } = string.Empty;

    /// <summary>Количество полученных достижений.</summary>
    public int AchievementsCount { get; set; }

    /// <summary>URL аватара пользователя.</summary>
    public string AvatarUrl { get; set; } = string.Empty;
}
