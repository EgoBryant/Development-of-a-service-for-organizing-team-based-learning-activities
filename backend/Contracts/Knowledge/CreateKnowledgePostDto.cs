using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Knowledge;

/// <summary>
/// Тело запроса создания объявления на «Бирже знаний» для API <c>POST /api/knowledge</c>.
/// </summary>
public class CreateKnowledgePostDto
{
    /// <summary>Заголовок объявления.</summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Описание предлагаемой помощи или запрашиваемой экспертизы.</summary>
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    /// <summary>Тип или предметная область объявления (например, «Java», «Матан»).</summary>
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    /// <summary>При <c>true</c> объявление публикуется только для участников команды автора.</summary>
    public bool PublishToTeam { get; set; }
}
