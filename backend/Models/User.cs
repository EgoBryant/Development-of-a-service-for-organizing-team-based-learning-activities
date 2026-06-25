namespace TeamExamProject.Models;

/// <summary>Учётная запись участника «Командного зачёта».</summary>
public class User
{
    /// <summary>Уникальный идентификатор пользователя.</summary>
    public int Id { get; set; }
    /// <summary>Логин для входа в систему.</summary>
    public string UserName { get; set; } = string.Empty;
    /// <summary>Основной адрес электронной почты (уникальный).</summary>
    public string Email { get; set; } = string.Empty;
    /// <summary>Хэш пароля.</summary>
    public string PasswordHash { get; set; } = string.Empty;
    /// <summary>Роль пользователя (см. <see cref="Roles"/>).</summary>
    public string Role { get; set; } = Roles.Student;
    /// <summary>Имя.</summary>
    public string FirstName { get; set; } = string.Empty;
    /// <summary>Фамилия.</summary>
    public string LastName { get; set; } = string.Empty;
    /// <summary>Отчество.</summary>
    public string MiddleName { get; set; } = string.Empty;
    /// <summary>Игровой никнейм.</summary>
    public string Nickname { get; set; } = string.Empty;
    /// <summary>Краткая биография в профиле.</summary>
    public string Bio { get; set; } = string.Empty;
    /// <summary>URL аватара пользователя.</summary>
    public string AvatarUrl { get; set; } = string.Empty;
    /// <summary>Контактный e-mail (может отличаться от основного).</summary>
    public string ContactEmail { get; set; } = string.Empty;
    /// <summary>Никнейм в Telegram.</summary>
    public string TelegramHandle { get; set; } = string.Empty;
    /// <summary>Номер телефона.</summary>
    public string PhoneNumber { get; set; } = string.Empty;
    /// <summary>Номер студенческого билета (уникальный).</summary>
    public int? StudentTicketNumber { get; set; }
    /// <summary>Текст академгруппы из ЛК (может не совпадать со справочником Groups).</summary>
    public string AcademicGroupLabel { get; set; } = string.Empty;
    /// <summary>Идентификатор академической группы.</summary>
    public int? GroupId { get; set; }
    /// <summary>Навигация к академической группе пользователя.</summary>
    public Group? Group { get; set; }
    /// <summary>Идентификатор команды, в которой состоит пользователь.</summary>
    public int? TeamId { get; set; }
    /// <summary>Навигация к команде пользователя.</summary>
    public Team? Team { get; set; }
    /// <summary>Персональные баллы пользователя (импорт/начисления). Используются в рейтинге пользователей.</summary>
    public int UserPoints { get; set; }
    /// <summary>SaaS-расширение: владелец-институт. В MVP nullable.</summary>
    public int? InstituteId { get; set; }
    /// <summary>Объявления пользователя на бирже знаний.</summary>
    public ICollection<KnowledgePost> KnowledgePosts { get; set; } = new List<KnowledgePost>();
    /// <summary>Заявки пользователя на вступление в команды.</summary>
    public ICollection<TeamJoinRequest> TeamJoinRequests { get; set; } = new List<TeamJoinRequest>();
    /// <summary>Исходящие голоса, отданные пользователем.</summary>
    public ICollection<Vote> OutgoingVotes { get; set; } = new List<Vote>();
    /// <summary>Входящие голоса, полученные пользователем.</summary>
    public ICollection<Vote> IncomingVotes { get; set; } = new List<Vote>();
    /// <summary>Полученные пользователем достижения.</summary>
    public ICollection<UserAchievement> Achievements { get; set; } = new List<UserAchievement>();
    /// <summary>Дата и время регистрации (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
