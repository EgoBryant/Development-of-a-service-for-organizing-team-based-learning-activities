namespace TeamExamProject.Contracts.Teams;

public class TeamMemberResponse
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsCaptain { get; set; }
    /// <summary>Готовое к показу имя (ФИО → nickname → userName). Используется фронтом в <c>TeamMemberView.displayName</c>.</summary>
    public string DisplayName { get; set; } = string.Empty;
    /// <summary>Роль для UI («КАПИТАН» | «УЧАСТНИК»). Соответствует <c>TeamMemberView.roleLabel</c>.</summary>
    public string RoleLabel { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public int UserPoints { get; set; }
}
