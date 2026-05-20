namespace TeamExamProject.Contracts.Knowledge;

public class KnowledgePostQuery
{
    public string? Search { get; set; }
    /// <summary>Фильтр по типу/тегу (например, «Java», «Матан»).</summary>
    public string? Type { get; set; }
}
