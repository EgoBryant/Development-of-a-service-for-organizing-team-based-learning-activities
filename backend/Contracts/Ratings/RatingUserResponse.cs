namespace TeamExamProject.Contracts.Ratings;

/// <summary>
/// Соответствует фронтовому <c>RatingUser</c>. <see cref="Id"/> и <see cref="TeamId"/> — строки.
/// </summary>
public class RatingUserResponse
{
    public string Id { get; set; } = string.Empty;
    public int Rank { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Points { get; set; }
    public bool HasTeam { get; set; }
    public string? TeamId { get; set; }
    /// <summary>Подпись лиги по порогам очков (БАЗОВАЯ / БРОНЗА / СЕРЕБРО / ЗОЛОТО). См. <c>FRONTEND-API-CONTRACT.md</c>.</summary>
    public string League { get; set; } = string.Empty;
    public int AchievementsCount { get; set; }
}
