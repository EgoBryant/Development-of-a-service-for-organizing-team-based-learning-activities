using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

public class UpdateTeamScoreRequest
{
    [Range(0, int.MaxValue)]
    public int Score { get; set; }
}
