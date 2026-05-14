using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

public class CreateTeamRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;
}
