namespace TeamExamProject.Models;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public int Score { get; set; } = 0;
    public int? CaptainUserId { get; set; }
    public User? Captain { get; set; }
    public ICollection<User> Members { get; set; } = new List<User>();
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
