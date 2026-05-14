using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

public class CreateTeamDto
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}
