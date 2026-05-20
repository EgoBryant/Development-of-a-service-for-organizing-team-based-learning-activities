using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.News;

public class CreateNewsDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(4000)]
    public string Body { get; set; } = string.Empty;
}
