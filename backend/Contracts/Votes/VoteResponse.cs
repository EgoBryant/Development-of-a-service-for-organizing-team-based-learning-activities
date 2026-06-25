namespace TeamExamProject.Contracts.Votes;

/// <summary>
/// Голос участника команды, возвращаемый API списка голосований (для капитана или администратора).
/// </summary>
public class VoteResponse
{
    /// <summary>Уникальный идентификатор голоса.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор команды, в рамках которой проводилось голосование.</summary>
    public int TeamId { get; set; }

    /// <summary>Идентификатор пользователя, отдавшего голос.</summary>
    public int FromUserId { get; set; }

    /// <summary>Имя пользователя, отдавшего голос.</summary>
    public string FromUserName { get; set; } = string.Empty;

    /// <summary>Идентификатор пользователя, получившего оценку.</summary>
    public int ToUserId { get; set; }

    /// <summary>Имя пользователя, получившего оценку.</summary>
    public string ToUserName { get; set; } = string.Empty;

    /// <summary>Выставленная оценка вклада (от 1 до 5).</summary>
    public int Score { get; set; }

    /// <summary>Дата и время голосования в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }
}
