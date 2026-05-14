namespace TeamExamProject.Contracts.Teams;

public class TeamResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public int? CaptainId { get; set; }
    public int Score { get; set; }
    public string CaptainUserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int MemberCount { get; set; }
    public List<TeamMemberResponse> Members { get; set; } = new();
}
