using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Challenges;

/// <summary>
/// Тело запроса создания нового челленджа для API администратора.
/// </summary>
public class CreateChallengeDto
{
    /// <summary>Название челленджа.</summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Описание условий и целей челленджа.</summary>
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    /// <summary>Количество бонусных очков за успешное выполнение (от 0 до 1000).</summary>
    [Range(0, 1000)]
    public int BonusPoints { get; set; }

    /// <summary>Признак активности челленджа сразу после создания.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Дата и время начала челленджа в UTC; <c>null</c>, если ограничение не задано.</summary>
    public DateTime? StartsAtUtc { get; set; }

    /// <summary>Дата и время окончания челленджа в UTC; <c>null</c>, если ограничение не задано.</summary>
    public DateTime? EndsAtUtc { get; set; }
}

/// <summary>
/// Тело запроса подачи доказательства выполнения челленджа командой.
/// </summary>
public class SubmitChallengeDto
{
    /// <summary>Текст доказательства или описание выполненной работы.</summary>
    [MaxLength(2000)]
    public string ProofText { get; set; } = string.Empty;
}

/// <summary>
/// Тело запроса модерации заявки на выполнение челленджа.
/// </summary>
public class ReviewChallengeProgressDto
{
    /// <summary>Approved | Rejected.</summary>
    [Required]
    public string Status { get; set; } = string.Empty;
}
