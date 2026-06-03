namespace TeamExamProject.Contracts.Ratings;

/// <summary>
/// Соответствует фронтовому <c>RatingTeam</c>. ВНИМАНИЕ: <see cref="Id"/> — строка, чтобы фронту не менять <c>id: string</c>.
/// </summary>
public class RatingTeamResponse
{
    public string Id { get; set; } = string.Empty;
    public int Rank { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Points { get; set; }
    public double Krk { get; set; }
    public string League { get; set; } = string.Empty;
    public int MemberCount { get; set; }
    public string CaptainName { get; set; } = string.Empty;
    /// <summary>Средняя внутрикомандная оценка 1..5.</summary>
    public double Cohesion { get; set; }
    public int ChallengeBonus { get; set; }
    public int CheckInsCount { get; set; }
    public int CompletedRescuesCount { get; set; }
    public List<RatingTeamMemberResponse> Members { get; set; } = new();
    public List<RatingTeamHistoryItemResponse> ActivityHistory { get; set; } = new();
}

public class RatingTeamMemberResponse
{
    public string Id { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string RoleLabel { get; set; } = string.Empty;
}

public class RatingTeamHistoryItemResponse
{
    public string Kind { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Meta { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public int? Points { get; set; }
}
