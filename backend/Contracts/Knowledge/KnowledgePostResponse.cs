namespace TeamExamProject.Contracts.Knowledge;

/// <summary>
/// Объявление «Биржи знаний», возвращаемое API списка и детализации.
/// </summary>
public class KnowledgePostResponse
{
    /// <summary>Уникальный идентификатор объявления.</summary>
    public int Id { get; set; }

    /// <summary>Заголовок объявления.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Описание предлагаемой помощи или запрашиваемой экспертизы.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Тип или предметная область объявления.</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Идентификатор автора объявления.</summary>
    public int UserId { get; set; }

    /// <summary>Имя автора объявления для отображения.</summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>Идентификатор команды автора; <c>null</c>, если объявление не привязано к команде.</summary>
    public int? TeamId { get; set; }

    /// <summary>Название команды автора.</summary>
    public string TeamName { get; set; } = string.Empty;

    /// <summary>Дата и время публикации объявления в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }
}
