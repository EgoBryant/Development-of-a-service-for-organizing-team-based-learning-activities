namespace TeamExamProject.Contracts.Teams;

public class CreateTeamJoinRequestDto
{
    public int TeamId { get; set; }
    public string Message { get; set; } = string.Empty;
}
