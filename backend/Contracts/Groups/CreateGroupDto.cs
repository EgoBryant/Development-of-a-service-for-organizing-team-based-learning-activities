using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Groups;

/// <summary>
/// Тело запроса создания академической группы для API администратора.
/// </summary>
public class CreateGroupDto
{
    /// <summary>Название группы (например, «ИВТ-401»).</summary>
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Курс обучения (например, «1», «2», «Маг»).</summary>
    [Required]
    [MaxLength(32)]
    public string Course { get; set; } = string.Empty;

    /// <summary>Название института или факультета.</summary>
    [Required]
    [MaxLength(150)]
    public string Faculty { get; set; } = string.Empty;
}
