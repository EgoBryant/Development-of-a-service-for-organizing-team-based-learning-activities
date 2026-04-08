namespace TeamExamProject.Models;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Score { get; set; } = 0;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
