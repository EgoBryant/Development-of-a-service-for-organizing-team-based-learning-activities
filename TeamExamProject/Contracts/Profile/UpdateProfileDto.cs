using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Profile;

public class UpdateProfileDto : IValidatableObject
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

    /// <summary>URL или data:image/...;base64,... — хранится в БД как text. Лимит длины — в ProfileService (без [MaxLength]: крупное фото в base64 легко &gt; 4M символов).</summary>
    public string AvatarUrl { get; set; } = string.Empty;

    /// <summary>Не [EmailAddress] на DTO: пусто и только пробелы валидны, проверка формата в <see cref="Validate"/>.</summary>
    [MaxLength(200)]
    public string ContactEmail { get; set; } = string.Empty;

    [MaxLength(100)]
    public string TelegramHandle { get; set; } = string.Empty;

    [MaxLength(32)]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>0 и отрицательные значения на сервисе приводят к «не задано»; отдельно проверяется, что заданный студак &gt; 0.</summary>
    public int? StudentTicketNumber { get; set; }

    public int? GroupId { get; set; }

    /// <summary>Свободный ввод группы с экрана профиля; при совпадении с Groups.Title выставляется GroupId.</summary>
    [MaxLength(100)]
    public string? AcademicGroupLabel { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var contact = ContactEmail?.Trim() ?? string.Empty;
        if (contact.Length > 0 && !new EmailAddressAttribute().IsValid(contact))
        {
            yield return new ValidationResult("The ContactEmail field is not a valid e-mail address.",
                [nameof(ContactEmail)]);
        }
    }
}
