namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Тело запроса подачи заявки на вступление в команду для API <c>POST /api/teams/join-requests</c>.
/// </summary>
public class CreateTeamJoinRequestDto
{
    /// <summary>Идентификатор команды, в которую пользователь хочет вступить.</summary>
    public int TeamId { get; set; }

    /// <summary>Сопроводительное сообщение для капитана команды.</summary>
    public string Message { get; set; } = string.Empty;
}
