namespace TeamExamProject.Models;

/// <summary>Новость организатора игры (отображается в ленте).</summary>
public class NewsItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime PublishedAtUtc { get; set; } = DateTime.UtcNow;
    public int? InstituteId { get; set; }
    public int? GameSeasonId { get; set; }
}
