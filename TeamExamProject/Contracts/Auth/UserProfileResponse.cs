namespace TeamExamProject.Contracts.Auth;

public class UserProfileResponse
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string TeamInviteCode { get; set; } = string.Empty;
    public bool IsCaptain { get; set; }
    public int TeamScore { get; set; }
}
