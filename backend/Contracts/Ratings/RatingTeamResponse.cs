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
    public List<RatingTeamMemberResponse> Members { get; set; } = new();
}

public class RatingTeamMemberResponse
{
    public string Id { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string RoleLabel { get; set; } = string.Empty;
}
