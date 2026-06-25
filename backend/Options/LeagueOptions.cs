namespace TeamExamProject.Options;

/// <summary>
/// Пороги персональных лиг по очкам (UserPoints). Конфигурируются в appsettings.
/// По умолчанию: 0..149 — БАЗОВАЯ, 150..299 — БРОНЗА, 300..399 — СЕРЕБРО, ≥400 — ЗОЛОТО.
/// </summary>
public class LeagueOptions
{
    /// <summary>Имя секции в конфигурации приложения.</summary>
    public const string SectionName = "Leagues";

    /// <summary>Минимум очков для лиги «Бронза».</summary>
    public int BronzeThreshold { get; set; } = 150;
    /// <summary>Минимум очков для лиги «Серебро».</summary>
    public int SilverThreshold { get; set; } = 300;
    /// <summary>Минимум очков для лиги «Золото».</summary>
    public int GoldThreshold { get; set; } = 400;

    /// <summary>Отображаемое название базовой лиги.</summary>
    public string BaseLabel { get; set; } = "БАЗОВАЯ";
    /// <summary>Отображаемое название бронзовой лиги.</summary>
    public string BronzeLabel { get; set; } = "БРОНЗА";
    /// <summary>Отображаемое название серебряной лиги.</summary>
    public string SilverLabel { get; set; } = "СЕРЕБРО";
    /// <summary>Отображаемое название золотой лиги.</summary>
    public string GoldLabel { get; set; } = "ЗОЛОТО";
}
