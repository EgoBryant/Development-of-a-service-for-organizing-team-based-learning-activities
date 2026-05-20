namespace TeamExamProject.Models;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    /// <summary>Командный счёт (baseRating). Источники: импорт оценок, ручные правки админа, начисление за «спасение» и челленджи.</summary>
    public int Score { get; set; } = 0;
    /// <summary>Кэш последнего рассчитанного КРК (0–10). Пересчитывается KrkCalculationService при изменениях.</summary>
    public double KrkCached { get; set; }
    /// <summary>Дата последнего пересчёта КРК.</summary>
    public DateTime? KrkCachedAtUtc { get; set; }
    public int? CaptainId { get; set; }
    public User? Captain { get; set; }
    /// <summary>SaaS-расширение: владелец-институт. В MVP nullable.</summary>
    public int? InstituteId { get; set; }
    /// <summary>SaaS-расширение: игровой сезон. В MVP nullable.</summary>
    public int? GameSeasonId { get; set; }
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<KnowledgePost> KnowledgePosts { get; set; } = new List<KnowledgePost>();
    public ICollection<HelpRequest> OutgoingHelpRequests { get; set; } = new List<HelpRequest>();
    public ICollection<HelpRequest> IncomingHelpRequests { get; set; } = new List<HelpRequest>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
    public ICollection<TeamChallengeProgress> ChallengeProgress { get; set; } = new List<TeamChallengeProgress>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
