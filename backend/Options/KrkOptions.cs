namespace TeamExamProject.Options;

/// <summary>
/// Веса компонентов формулы КРК (баз. рейтинг / сплочённость / челленджи).
/// Значения берутся из конфигурации; сумма должна давать 1.0 (валидация в Program.cs).
/// </summary>
public class KrkOptions
{
    /// <summary>Имя секции в конфигурации приложения.</summary>
    public const string SectionName = "Krk";

    /// <summary>Вес базового рейтинга в формуле КРК (по умолчанию 0.6).</summary>
    public double BaseWeight { get; set; } = 0.6;
    /// <summary>Вес коэффициента сплочённости (по умолчанию 0.3).</summary>
    public double CohesionWeight { get; set; } = 0.3;
    /// <summary>Вес бонуса за челленджи (по умолчанию 0.1).</summary>
    public double ChallengeWeight { get; set; } = 0.1;
}
