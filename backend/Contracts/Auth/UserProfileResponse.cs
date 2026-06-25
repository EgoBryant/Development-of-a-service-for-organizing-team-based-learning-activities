namespace TeamExamProject.Contracts.Auth;

/// <summary>
/// Профиль текущего пользователя для API <c>GET /api/auth/me</c>.
/// Содержит учётные данные, контакты, привязку к группе и команде, а также персональные рейтинговые показатели.
/// </summary>
public class UserProfileResponse
{
    /// <summary>Уникальный идентификатор пользователя.</summary>
    public int Id { get; set; }

    /// <summary>Логин пользователя в системе.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>Основной адрес электронной почты, используемый для входа.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Роль пользователя в системе (например, Student, Admin).</summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>Имя пользователя.</summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>Фамилия пользователя.</summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>Отчество пользователя.</summary>
    public string MiddleName { get; set; } = string.Empty;

    /// <summary>Отображаемый никнейм; используется в UI при отсутствии полного ФИО.</summary>
    public string Nickname { get; set; } = string.Empty;

    /// <summary>Краткая биография или описание профиля.</summary>
    public string Bio { get; set; } = string.Empty;

    /// <summary>URL аватара или строка data URI с изображением.</summary>
    public string AvatarUrl { get; set; } = string.Empty;

    /// <summary>Контактный e-mail, отображаемый в профиле (может отличаться от <see cref="Email"/>).</summary>
    public string ContactEmail { get; set; } = string.Empty;

    /// <summary>Имя пользователя или ссылка на профиль в Telegram.</summary>
    public string TelegramHandle { get; set; } = string.Empty;

    /// <summary>Контактный номер телефона.</summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>Номер студенческого билета; <c>null</c>, если не указан.</summary>
    public int? StudentTicketNumber { get; set; }

    /// <summary>Идентификатор академической группы; <c>null</c>, если группа не назначена.</summary>
    public int? GroupId { get; set; }

    /// <summary>Название академической группы для отображения в UI.</summary>
    public string GroupTitle { get; set; } = string.Empty;

    /// <summary>Идентификатор команды пользователя; <c>null</c>, если пользователь не состоит в команде.</summary>
    public int? TeamId { get; set; }

    /// <summary>Название команды пользователя.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Код приглашения в команду для передачи новым участникам.</summary>
    public string TeamInviteCode { get; set; } = string.Empty;

    /// <summary>Признак того, что пользователь является капитаном своей команды.</summary>
    public bool IsCaptain { get; set; }

    /// <summary>Текущий суммарный счёт команды пользователя.</summary>
    public int TeamScore { get; set; }

    /// <summary>Личные очки пользователя в общем рейтинге.</summary>
    public int UserPoints { get; set; }

    /// <summary>Персональный рейтинговый показатель пользователя.</summary>
    public int PersonalRating { get; set; }

    /// <summary>Место пользователя в персональном лидерборде.</summary>
    public int PersonalRank { get; set; }

    /// <summary>Средняя оценка вклада пользователя по анонимным голосам команды (шкала 1–5).</summary>
    public double PersonalContribution { get; set; }

    /// <summary>Лига пользователя по порогам очков (например, БАЗОВАЯ, БРОНЗА, СЕРЕБРО, ЗОЛОТО).</summary>
    public string PersonalLeague { get; set; } = string.Empty;
}
