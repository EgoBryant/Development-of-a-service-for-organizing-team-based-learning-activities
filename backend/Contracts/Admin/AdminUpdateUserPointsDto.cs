using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Admin;

public class AdminUpdateUserPointsDto
{
    [Range(0, 1_000_000)]
    public int UserPoints { get; set; }
}

public class AdminUpdateTeamScoreDto
{
    [Range(0, 1_000_000)]
    public int Score { get; set; }
}

public class AdminModerateKnowledgePostDto
{
    /// <summary>delete | hide. В MVP используется только delete.</summary>
    public string Action { get; set; } = "delete";
}
