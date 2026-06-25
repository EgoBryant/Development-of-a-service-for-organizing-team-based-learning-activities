using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Тело запроса обновления команды капитаном (<c>PATCH /api/teams/me</c>).
/// </summary>
public class UpdateTeamDto
{
    /// <summary>Новое название команды.</summary>
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;
}
