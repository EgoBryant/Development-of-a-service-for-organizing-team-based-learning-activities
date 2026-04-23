using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Groups;

public class CreateGroupDto
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string Course { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Faculty { get; set; } = string.Empty;
}
