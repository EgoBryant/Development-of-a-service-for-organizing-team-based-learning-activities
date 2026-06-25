using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Votes;

/// <summary>
/// Тело запроса анонимной оценки вклада участника команды для API <c>POST /api/votes</c>.
/// </summary>
public class CreateVoteDto
{
    /// <summary>Идентификатор пользователя, которому выставляется оценка.</summary>
    [Range(1, int.MaxValue)]
    public int ToUserId { get; set; }

    /// <summary>Оценка вклада по пятибалльной шкале (от 1 до 5).</summary>
    [Range(1, 5)]
    public int Score { get; set; }
}
