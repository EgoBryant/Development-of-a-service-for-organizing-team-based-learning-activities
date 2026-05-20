namespace TeamExamProject.Contracts.Ratings;

/// <summary>Параметры запроса лидерборда. Совпадают со значениями <c>RatingSortKey</c> на фронте.</summary>
public class RatingQuery
{
    public string? Search { get; set; }

    /// <summary>rank-asc | rank-desc | points-desc | points-asc | name-asc. По умолчанию rank-asc.</summary>
    public string? Sort { get; set; }

    /// <summary>Если задано — ограничивает выдачу (для «зала славы» используйте <c>limit=10</c>).</summary>
    public int? Limit { get; set; }
}
