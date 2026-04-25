namespace TeamExamProject.Contracts.Auth;

public class AuthResponse
{
    /// <summary>Идентичен профилю; с фронта не обязан вызывать GET /me сразу после login/register.</summary>
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string MiddleName { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string TelegramHandle { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int? StudentTicketNumber { get; set; }
    public int? GroupId { get; set; }
    public string GroupTitle { get; set; } = string.Empty;
    public int? TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string TeamInviteCode { get; set; } = string.Empty;
    public bool IsCaptain { get; set; }
    public int TeamScore { get; set; }
}
