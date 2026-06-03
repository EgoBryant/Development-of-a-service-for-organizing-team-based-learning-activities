namespace TeamExamProject.Models;

public class TeamJoinRequest
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public Team? Team { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = TeamJoinRequestStatuses.Pending;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? DecidedAtUtc { get; set; }
    public int? DecidedByUserId { get; set; }
    public User? DecidedByUser { get; set; }
}

public static class TeamJoinRequestStatuses
{
    public const string Pending = "Pending";
    public const string Accepted = "Accepted";
    public const string Rejected = "Rejected";
    public const string Cancelled = "Cancelled";
}
