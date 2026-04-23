namespace TeamExamProject.Models;

public class KnowledgePost
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User? User { get; set; }
    public int? TeamId { get; set; }
    public Team? Team { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
