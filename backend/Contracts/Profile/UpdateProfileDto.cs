using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Profile;

/// <summary>
/// Тело запроса обновления профиля текущего пользователя для API <c>PATCH /api/profile</c>.
/// Все поля необязательны; передаются только изменяемые значения.
/// </summary>
public class UpdateProfileDto : IValidatableObject
{
    /// <summary>Имя пользователя.</summary>
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>Фамилия пользователя.</summary>
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    /// <summary>Отчество пользователя.</summary>
    [MaxLength(100)]
    public string MiddleName { get; set; } = string.Empty;

    /// <summary>Отображаемый никнейм.</summary>
    [MaxLength(100)]
    public string Nickname { get; set; } = string.Empty;

    /// <summary>Краткая биография или описание профиля.</summary>
    [MaxLength(1000)]
    public string Bio { get; set; } = string.Empty;

    /// <summary>URL или data:image/...;base64,... — хранится в БД как text. Лимит длины — в ProfileService (без [MaxLength]: крупное фото в base64 легко &gt; 4M символов).</summary>
    public string AvatarUrl { get; set; } = string.Empty;

    /// <summary>Не [EmailAddress] на DTO: пусто и только пробелы валидны, проверка формата в <see cref="Validate"/>.</summary>
    [MaxLength(200)]
    public string ContactEmail { get; set; } = string.Empty;

    /// <summary>Имя пользователя или ссылка на профиль в Telegram.</summary>
    [MaxLength(100)]
    public string TelegramHandle { get; set; } = string.Empty;

    /// <summary>Контактный номер телефона.</summary>
    [MaxLength(32)]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>0 и отрицательные значения на сервисе приводят к «не задано»; отдельно проверяется, что заданный студак &gt; 0.</summary>
    public int? StudentTicketNumber { get; set; }

    /// <summary>Идентификатор академической группы; при указании имеет приоритет над <see cref="AcademicGroupLabel"/>.</summary>
    public int? GroupId { get; set; }

    /// <summary>Свободный ввод группы с экрана профиля; при совпадении с Groups.Title выставляется GroupId.</summary>
    [MaxLength(100)]
    public string? AcademicGroupLabel { get; set; }

    /// <summary>
    /// Дополнительная валидация полей профиля, не покрываемая атрибутами data annotations.
    /// </summary>
    /// <param name="validationContext">Контекст валидации модели.</param>
    /// <returns>Коллекция ошибок валидации; пустая, если данные корректны.</returns>
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
