using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Тело запроса обновления счёта команды для API <c>PATCH /api/teams/{id}/score</c>.
/// </summary>
public class UpdateTeamScoreRequest
{
    /// <summary>Новое значение счёта команды; не может быть отрицательным.</summary>
    [Range(0, int.MaxValue)]
    public int Score { get; set; }
}
