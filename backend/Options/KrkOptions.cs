namespace TeamExamProject.Options;

/// <summary>
/// Веса компонентов формулы КРК (баз. рейтинг / сплочённость / челленджи).
/// Значения берутся из конфигурации; сумма должна давать 1.0 (валидация в Program.cs).
/// </summary>
public class KrkOptions
{
    public const string SectionName = "Krk";

    public double BaseWeight { get; set; } = 0.6;
    public double CohesionWeight { get; set; } = 0.3;
    public double ChallengeWeight { get; set; } = 0.1;
}
