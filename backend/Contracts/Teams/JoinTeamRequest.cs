using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Teams;

public class JoinTeamRequest
{
    [Required]
    [MaxLength(16)]
    public string InviteCode { get; set; } = string.Empty;
}
