namespace TeamExamProject.Contracts.Groups;

public class GroupResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Faculty { get; set; } = string.Empty;
    public int StudentCount { get; set; }
}
