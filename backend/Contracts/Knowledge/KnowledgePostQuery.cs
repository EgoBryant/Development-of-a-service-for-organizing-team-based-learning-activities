namespace TeamExamProject.Contracts.Knowledge;

/// <summary>
/// Параметры фильтрации объявлений «Биржи знаний» для API <c>GET /api/knowledge</c>.
/// </summary>
public class KnowledgePostQuery
{
    /// <summary>Строка поиска по заголовку и описанию объявлений.</summary>
    public string? Search { get; set; }

    /// <summary>Фильтр по типу/тегу (например, «Java», «Матан»).</summary>
    public string? Type { get; set; }
}
