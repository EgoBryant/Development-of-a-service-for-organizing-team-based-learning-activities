namespace TeamExamProject.Contracts.HelpRequests;

public class HelpRequestResponse
{
    public int Id { get; set; }
    public int FromTeamId { get; set; }
    public string FromTeamName { get; set; } = string.Empty;
    public int ToTeamId { get; set; }
    public string ToTeamName { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public DateTime? ScheduledAtUtc { get; set; }
    public string LeagueLabel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double BonusPoints { get; set; }
    public bool BonusAwarded { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
