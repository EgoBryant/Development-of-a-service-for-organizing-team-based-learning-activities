namespace TeamExamProject.Models;

/// <summary>Академическая группа студентов.</summary>
public class Group
{
    /// <summary>Уникальный идентификатор группы.</summary>
    public int Id { get; set; }
    /// <summary>Название группы (например, «ИВТ-101»).</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Курс обучения.</summary>
    public string Course { get; set; } = string.Empty;
    /// <summary>Факультет или институт.</summary>
    public string Faculty { get; set; } = string.Empty;
    /// <summary>Студенты, привязанные к этой группе.</summary>
    public ICollection<User> Users { get; set; } = new List<User>();
}
