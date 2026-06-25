using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Тело запроса вступления в команду по коду приглашения для API <c>POST /api/teams/join</c>.
/// </summary>
public class JoinTeamRequest
{
    /// <summary>Код приглашения команды, полученный от капитана или участника.</summary>
    [Required]
    [MaxLength(16)]
    public string InviteCode { get; set; } = string.Empty;
}
