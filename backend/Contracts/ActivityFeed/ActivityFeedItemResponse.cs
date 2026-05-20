namespace TeamExamProject.Contracts.ActivityFeed;

public class ActivityFeedItemResponse
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
