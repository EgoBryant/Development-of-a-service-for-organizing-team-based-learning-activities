namespace TeamExamProject.Models;

public class User
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = Roles.Student;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string TelegramHandle { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int? StudentTicketNumber { get; set; }
    /// <summary>Текст академгруппы из ЛК (может не совпадать со справочником Groups).</summary>
    public string AcademicGroupLabel { get; set; } = string.Empty;
    public int? GroupId { get; set; }
    public Group? Group { get; set; }
    public int? TeamId { get; set; }
    public Team? Team { get; set; }
    /// <summary>Персональные баллы пользователя (импорт/начисления). Используются в рейтинге пользователей.</summary>
    public int UserPoints { get; set; }
    /// <summary>SaaS-расширение: владелец-институт. В MVP nullable.</summary>
    public int? InstituteId { get; set; }
    public ICollection<KnowledgePost> KnowledgePosts { get; set; } = new List<KnowledgePost>();
    public ICollection<Vote> OutgoingVotes { get; set; } = new List<Vote>();
    public ICollection<Vote> IncomingVotes { get; set; } = new List<Vote>();
    public ICollection<UserAchievement> Achievements { get; set; } = new List<UserAchievement>();
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
