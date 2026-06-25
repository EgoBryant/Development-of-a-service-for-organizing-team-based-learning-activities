namespace TeamExamProject.Models;

/// <summary>Каталог ачивок.</summary>
public class Achievement
{
    /// <summary>Уникальный идентификатор достижения.</summary>
    public int Id { get; set; }
    /// <summary>Машинный код ачивки (например, FIRST_CHECKIN, FIRST_RESCUE, TOP3_TEAM).</summary>
    public string Code { get; set; } = string.Empty;
    /// <summary>Отображаемое название достижения.</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Описание условий получения.</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>URL иконки достижения.</summary>
    public string IconUrl { get; set; } = string.Empty;
    /// <summary>Дата и время добавления в каталог (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    /// <summary>Пользователи, получившие это достижение.</summary>
    public ICollection<UserAchievement> Holders { get; set; } = new List<UserAchievement>();
}

/// <summary>Связь пользователя с полученным достижением.</summary>
public class UserAchievement
{
    /// <summary>Уникальный идентификатор записи.</summary>
    public int Id { get; set; }
    /// <summary>Идентификатор пользователя.</summary>
    public int UserId { get; set; }
    /// <summary>Навигация к пользователю-обладателю.</summary>
    public User? User { get; set; }
    /// <summary>Идентификатор достижения.</summary>
    public int AchievementId { get; set; }
    /// <summary>Навигация к каталожной записи достижения.</summary>
    public Achievement? Achievement { get; set; }
    /// <summary>Дата и время получения достижения (UTC).</summary>
    public DateTime EarnedAtUtc { get; set; } = DateTime.UtcNow;
}

/// <summary>Машинные коды стандартных достижений MVP.</summary>
public static class AchievementCodes
{
    /// <summary>Первый сданный check-in.</summary>
    public const string FirstCheckIn = "FIRST_CHECKIN";
    /// <summary>Первое успешное «спасение» другой команды.</summary>
    public const string FirstRescue = "FIRST_RESCUE";
    /// <summary>Попадание команды в топ-3 рейтинга.</summary>
    public const string Top3Team = "TOP3_TEAM";
    /// <summary>Первый голос за тиммейта.</summary>
    public const string FirstVote = "FIRST_VOTE";
    /// <summary>Первый сданный челлендж.</summary>
    public const string FirstChallenge = "FIRST_CHALLENGE";
}
