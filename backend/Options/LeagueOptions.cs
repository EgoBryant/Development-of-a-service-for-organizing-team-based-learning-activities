namespace TeamExamProject.Options;

/// <summary>
/// Пороги персональных лиг по очкам (UserPoints). Конфигурируются в appsettings.
/// По умолчанию: 0..149 — БАЗОВАЯ, 150..299 — БРОНЗА, 300..399 — СЕРЕБРО, ≥400 — ЗОЛОТО.
/// </summary>
public class LeagueOptions
{
    public const string SectionName = "Leagues";

    public int BronzeThreshold { get; set; } = 150;
    public int SilverThreshold { get; set; } = 300;
    public int GoldThreshold { get; set; } = 400;

    public string BaseLabel { get; set; } = "БАЗОВАЯ";
    public string BronzeLabel { get; set; } = "БРОНЗА";
    public string SilverLabel { get; set; } = "СЕРЕБРО";
    public string GoldLabel { get; set; } = "ЗОЛОТО";
}
