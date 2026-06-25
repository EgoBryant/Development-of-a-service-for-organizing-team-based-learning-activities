namespace TeamExamProject.Models;

/// <summary>Игровая команда студентов в рамках «Командного зачёта».</summary>
public class Team
{
    /// <summary>Уникальный идентификатор команды.</summary>
    public int Id { get; set; }
    /// <summary>Название команды.</summary>
    public string Name { get; set; } = string.Empty;
    /// <summary>Краткое описание команды.</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>Код приглашения для вступления в команду.</summary>
    public string InviteCode { get; set; } = string.Empty;
    /// <summary>Командный счёт (baseRating). Источники: импорт оценок, ручные правки админа, начисление за «спасение» и челленджи.</summary>
    public int Score { get; set; } = 0;
    /// <summary>Кэш последнего рассчитанного КРК (0–10). Пересчитывается KrkCalculationService при изменениях.</summary>
    public double KrkCached { get; set; }
    /// <summary>Дата последнего пересчёта КРК.</summary>
    public DateTime? KrkCachedAtUtc { get; set; }
    /// <summary>Идентификатор капитана команды.</summary>
    public int? CaptainId { get; set; }
    /// <summary>Навигация к пользователю-капитану команды.</summary>
    public User? Captain { get; set; }
    /// <summary>SaaS-расширение: владелец-институт. В MVP nullable.</summary>
    public int? InstituteId { get; set; }
    /// <summary>SaaS-расширение: игровой сезон. В MVP nullable.</summary>
    public int? GameSeasonId { get; set; }
    /// <summary>Участники команды (связь один-ко-многим с пользователями).</summary>
    public ICollection<User> Members { get; set; } = new List<User>();
    /// <summary>Объявления команды на бирже знаний.</summary>
    public ICollection<KnowledgePost> KnowledgePosts { get; set; } = new List<KnowledgePost>();
    /// <summary>Исходящие запросы на помощь от этой команды.</summary>
    public ICollection<HelpRequest> OutgoingHelpRequests { get; set; } = new List<HelpRequest>();
    /// <summary>Входящие запросы на помощь к этой команде.</summary>
    public ICollection<HelpRequest> IncomingHelpRequests { get; set; } = new List<HelpRequest>();
    /// <summary>Заявки на вступление в команду.</summary>
    public ICollection<TeamJoinRequest> JoinRequests { get; set; } = new List<TeamJoinRequest>();
    /// <summary>Голоса участников внутри команды.</summary>
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    /// <summary>Еженедельные отчёты (check-in) команды.</summary>
    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
    /// <summary>Прогресс команды по челленджам.</summary>
    public ICollection<TeamChallengeProgress> ChallengeProgress { get; set; } = new List<TeamChallengeProgress>();
    /// <summary>Дата и время создания команды (UTC).</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
