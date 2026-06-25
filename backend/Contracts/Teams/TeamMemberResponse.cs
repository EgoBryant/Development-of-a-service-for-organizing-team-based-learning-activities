namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Участник команды в ответе API детализации команды.
/// </summary>
public class TeamMemberResponse
{
    /// <summary>Уникальный идентификатор пользователя.</summary>
    public int Id { get; set; }

    /// <summary>Логин пользователя в системе.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>Основной адрес электронной почты пользователя.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Роль пользователя в системе (например, Student).</summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>Признак того, что участник является капитаном команды.</summary>
    public bool IsCaptain { get; set; }

    /// <summary>Готовое к показу имя (ФИО → nickname → userName). Используется фронтом в <c>TeamMemberView.displayName</c>.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Роль для UI («КАПИТАН» | «УЧАСТНИК»). Соответствует <c>TeamMemberView.roleLabel</c>.</summary>
    public string RoleLabel { get; set; } = string.Empty;

    /// <summary>URL аватара участника.</summary>
    public string AvatarUrl { get; set; } = string.Empty;

    /// <summary>Личные очки участника в общем рейтинге.</summary>
    public int UserPoints { get; set; }
}
