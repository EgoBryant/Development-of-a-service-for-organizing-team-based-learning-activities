namespace TeamExamProject.Contracts.Ratings;

/// <summary>
/// Соответствует фронтовому <c>RatingTeam</c>. ВНИМАНИЕ: <see cref="Id"/> — строка, чтобы фронту не менять <c>id: string</c>.
/// </summary>
public class RatingTeamResponse
{
    /// <summary>Строковый идентификатор команды для совместимости с фронтендом.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Текущее место команды в командном лидерборде.</summary>
    public int Rank { get; set; }

    /// <summary>Название команды.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Суммарные очки команды.</summary>
    public int Points { get; set; }

    /// <summary>Командный рейтинговый коэффициент (КРК), рассчитанный по формуле платформы.</summary>
    public double Krk { get; set; }

    /// <summary>Лига команды по порогам очков.</summary>
    public string League { get; set; } = string.Empty;

    /// <summary>Количество участников в команде.</summary>
    public int MemberCount { get; set; }

    /// <summary>Отображаемое имя капитана команды.</summary>
    public string CaptainName { get; set; } = string.Empty;

    /// <summary>Средняя внутрикомандная оценка 1..5.</summary>
    public double Cohesion { get; set; }

    /// <summary>Бонусные очки, начисленные за выполнение челленджей.</summary>
    public int ChallengeBonus { get; set; }

    /// <summary>Количество сданных еженедельных чек-инов.</summary>
    public int CheckInsCount { get; set; }

    /// <summary>Количество успешно завершённых операций «спасения» других команд.</summary>
    public int CompletedRescuesCount { get; set; }

    /// <summary>Список участников команды с краткими данными для лидерборда.</summary>
    public List<RatingTeamMemberResponse> Members { get; set; } = new();

    /// <summary>Хронология ключевых событий активности команды.</summary>
    public List<RatingTeamHistoryItemResponse> ActivityHistory { get; set; } = new();
}

/// <summary>
/// Участник команды в контексте командного рейтинга.
/// </summary>
public class RatingTeamMemberResponse
{
    /// <summary>Строковый идентификатор пользователя.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Готовое к показу имя участника.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Роль участника для UI (например, «КАПИТАН», «УЧАСТНИК»).</summary>
    public string RoleLabel { get; set; } = string.Empty;

    /// <summary>URL аватара участника.</summary>
    public string AvatarUrl { get; set; } = string.Empty;
}

/// <summary>
/// Элемент истории активности команды в лидерборде.
/// </summary>
public class RatingTeamHistoryItemResponse
{
    /// <summary>Тип события (например, check-in, rescue, challenge).</summary>
    public string Kind { get; set; } = string.Empty;

    /// <summary>Заголовок события для отображения.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Дополнительная метаинформация (дата, статус и т.п.).</summary>
    public string Meta { get; set; } = string.Empty;

    /// <summary>Дата и время события в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>Количество начисленных очков за событие; <c>null</c>, если очки не применимы.</summary>
    public int? Points { get; set; }
}
