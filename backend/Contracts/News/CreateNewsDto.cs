using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.News;

/// <summary>
/// Тело запроса создания новости для API администратора <c>POST /api/news</c>.
/// </summary>
public class CreateNewsDto
{
    /// <summary>Заголовок новости.</summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Текст новости.</summary>
    [Required]
    [MaxLength(4000)]
    public string Body { get; set; } = string.Empty;
}
