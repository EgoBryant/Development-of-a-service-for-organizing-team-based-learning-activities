namespace TeamExamProject.Options;

/// <summary>
/// Ограничения команд. По умолчанию в команде не более 6 участников.
/// </summary>
public class TeamOptions
{
    public const string SectionName = "Teams";

    public int MaxMembers { get; set; } = 6;
}
