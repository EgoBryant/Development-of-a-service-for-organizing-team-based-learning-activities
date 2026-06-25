using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Тело запроса создания новой команды для API <c>POST /api/teams</c>.
/// </summary>
public class CreateTeamDto
{
    /// <summary>Название команды.</summary>
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Краткое описание команды и её целей.</summary>
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}
