namespace TeamExamProject.Contracts.News;

/// <summary>
/// Новостная публикация платформы, возвращаемая API списка и детализации новостей.
/// </summary>
public class NewsResponse
{
    /// <summary>Уникальный идентификатор новости.</summary>
    public int Id { get; set; }

    /// <summary>Заголовок новости.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Текст новости.</summary>
    public string Body { get; set; } = string.Empty;

    /// <summary>Дата и время публикации новости в UTC.</summary>
    public DateTime PublishedAtUtc { get; set; }
}
