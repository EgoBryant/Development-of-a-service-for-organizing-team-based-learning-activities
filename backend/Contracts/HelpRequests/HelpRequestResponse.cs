namespace TeamExamProject.Contracts.HelpRequests;

public class HelpRequestResponse
{
    public int Id { get; set; }
    public int FromTeamId { get; set; }
    public string FromTeamName { get; set; } = string.Empty;
    public int ToTeamId { get; set; }
    public string ToTeamName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double BonusPoints { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
