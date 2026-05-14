namespace TeamExamProject.Models;

public class HelpRequest
{
    public int Id { get; set; }
    public int FromTeamId { get; set; }
    public Team? FromTeam { get; set; }
    public int ToTeamId { get; set; }
    public Team? ToTeam { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = HelpRequestStatuses.Open;
    public double BonusPoints { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
