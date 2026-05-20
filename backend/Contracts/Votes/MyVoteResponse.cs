namespace TeamExamProject.Contracts.Votes;

/// <summary>Голос, отданный текущим пользователем (для UI «кого уже оценил»).</summary>
public class MyVoteResponse
{
    public int Id { get; set; }
    public int ToUserId { get; set; }
    public string ToUserName { get; set; } = string.Empty;
    public int Score { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
