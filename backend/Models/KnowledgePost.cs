namespace TeamExamProject.Models;

/// <summary>Объявление на бирже знаний (запрос или предложение экспертизы).</summary>
public class KnowledgePost
{
    /// <summary>Уникальный идентификатор объявления.</summary>
    public int Id { get; set; }
    /// <summary>Заголовок объявления.</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Подробное описание.</summary>
    public string Description { get; set; } = string.Empty;
    /// <summary>Тип объявления (запрос, предложение и т.д.).</summary>
    public string Type { get; set; } = string.Empty;
    /// <summary>Идентификатор автора объявления.</summary>
    public int UserId { get; set; }
    /// <summary>Навигация к автору объявления.</summary>
    public User? User { get; set; }
    /// <summary>Идентификатор команды-автора (если применимо).</summary>
    public int? TeamId { get; set; }
    /// <summary>Навигация к команде, от имени которой опубликовано объявление.</summary>
    public Team? Team { get; set; }
    /// <summary>Дата и время публикации (UTC).</summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
