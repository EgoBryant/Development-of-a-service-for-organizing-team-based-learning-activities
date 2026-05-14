namespace TeamExamProject.Models;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public int Score { get; set; } = 0;
    public int? CaptainId { get; set; }
    public User? Captain { get; set; }
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<KnowledgePost> KnowledgePosts { get; set; } = new List<KnowledgePost>();
    public ICollection<HelpRequest> OutgoingHelpRequests { get; set; } = new List<HelpRequest>();
    public ICollection<HelpRequest> IncomingHelpRequests { get; set; } = new List<HelpRequest>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
