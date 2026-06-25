using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.HelpRequests;

/// <summary>
/// Тело запроса изменения статуса запроса на «спасение».
/// </summary>
public class UpdateHelpRequestStatusDto
{
    /// <summary>Новый статус запроса (например, Accepted, Completed, Cancelled).</summary>
    [Required]
    [MaxLength(32)]
    public string Status { get; set; } = string.Empty;
}
