using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Profile;

public class UpdateProfileDto
{
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string MiddleName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Nickname { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Bio { get; set; } = string.Empty;

    [Url]
    [MaxLength(500)]
    public string AvatarUrl { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(200)]
    public string ContactEmail { get; set; } = string.Empty;

    [MaxLength(100)]
    public string TelegramHandle { get; set; } = string.Empty;

    [Phone]
    [MaxLength(32)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int? StudentTicketNumber { get; set; }

    [Range(1, int.MaxValue)]
    public int? GroupId { get; set; }
}
