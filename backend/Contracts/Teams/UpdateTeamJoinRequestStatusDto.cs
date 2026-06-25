namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Тело запроса изменения статуса заявки на вступление в команду.
/// </summary>
public class UpdateTeamJoinRequestStatusDto
{
    /// <summary>Новый статус заявки (например, Approved или Rejected).</summary>
    public string Status { get; set; } = string.Empty;
}
