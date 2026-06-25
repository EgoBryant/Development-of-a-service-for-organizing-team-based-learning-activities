namespace TeamExamProject.Models;

/// <summary>Новость организатора игры (отображается в ленте).</summary>
public class NewsItem
{
    /// <summary>Уникальный идентификатор новости.</summary>
    public int Id { get; set; }
    /// <summary>Заголовок новости.</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Текст новости.</summary>
    public string Body { get; set; } = string.Empty;
    /// <summary>Дата и время публикации (UTC).</summary>
    public DateTime PublishedAtUtc { get; set; } = DateTime.UtcNow;
    /// <summary>SaaS-расширение: идентификатор института.</summary>
    public int? InstituteId { get; set; }
    /// <summary>SaaS-расширение: идентификатор игрового сезона.</summary>
    public int? GameSeasonId { get; set; }
}
