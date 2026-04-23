namespace TeamExamProject.Contracts.Votes;

public class VoteResponse
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public int FromUserId { get; set; }
    public string FromUserName { get; set; } = string.Empty;
    public int ToUserId { get; set; }
    public string ToUserName { get; set; } = string.Empty;
    public int Score { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
