namespace TeamExamProject.Contracts.News;

public class NewsResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime PublishedAtUtc { get; set; }
}
