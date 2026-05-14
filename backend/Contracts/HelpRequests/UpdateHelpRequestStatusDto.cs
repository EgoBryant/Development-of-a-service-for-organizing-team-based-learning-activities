using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.HelpRequests;

public class UpdateHelpRequestStatusDto
{
    [Required]
    [MaxLength(32)]
    public string Status { get; set; } = string.Empty;
}
