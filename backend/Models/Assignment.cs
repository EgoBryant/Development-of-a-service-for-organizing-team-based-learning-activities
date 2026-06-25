namespace TeamExamProject.Models;

/// <summary>Задание для ленты на вкладке «Задания».</summary>
public class Assignment
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DeadlineLabel { get; set; } = string.Empty;
    public DateTime? DeadlineUtc { get; set; }
    /// <summary>Лига КРК: novice | pro | legend.</summary>
    public string LeagueTier { get; set; } = "pro";
    public bool IsActive { get; set; } = true;
    /// <summary>Доступно для показа в анимированной ленте.</summary>
    public bool IsAvailableInFeed { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
