using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Knowledge;

public class CreateKnowledgePostDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    public bool PublishToTeam { get; set; }
}
