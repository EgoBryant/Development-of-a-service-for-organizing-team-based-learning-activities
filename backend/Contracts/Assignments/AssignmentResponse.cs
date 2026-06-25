namespace TeamExamProject.Contracts.Assignments;

public class AssignmentResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DeadlineLabel { get; set; } = string.Empty;
    public DateTime? DeadlineUtc { get; set; }
    public string LeagueTier { get; set; } = string.Empty;
    public bool IsAvailableInFeed { get; set; }
}
