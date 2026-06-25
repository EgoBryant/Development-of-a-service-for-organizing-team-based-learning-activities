namespace TeamExamProject.Options;

/// <summary>
/// Ограничения команд. По умолчанию в команде не более 6 участников.
/// </summary>
public class TeamOptions
{
    /// <summary>Имя секции в конфигурации приложения.</summary>
    public const string SectionName = "Teams";

    /// <summary>Максимальное число участников в одной команде.</summary>
    public int MaxMembers { get; set; } = 6;
}
