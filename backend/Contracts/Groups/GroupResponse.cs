namespace TeamExamProject.Contracts.Groups;

/// <summary>
/// Академическая группа, возвращаемая API списка и детализации групп.
/// </summary>
public class GroupResponse
{
    /// <summary>Уникальный идентификатор группы.</summary>
    public int Id { get; set; }

    /// <summary>Название группы (например, «ИВТ-401»).</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Курс обучения.</summary>
    public string Course { get; set; } = string.Empty;

    /// <summary>Название института или факультета.</summary>
    public string Faculty { get; set; } = string.Empty;

    /// <summary>Количество студентов, привязанных к группе.</summary>
    public int StudentCount { get; set; }
}
