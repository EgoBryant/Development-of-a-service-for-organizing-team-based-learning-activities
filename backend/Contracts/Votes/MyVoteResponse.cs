namespace TeamExamProject.Contracts.Votes;

/// <summary>Голос, отданный текущим пользователем (для UI «кого уже оценил»).</summary>
public class MyVoteResponse
{
    /// <summary>Уникальный идентификатор голоса.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор пользователя, которому была выставлена оценка.</summary>
    public int ToUserId { get; set; }

    /// <summary>Имя пользователя, которому была выставлена оценка.</summary>
    public string ToUserName { get; set; } = string.Empty;

    /// <summary>Выставленная оценка вклада (от 1 до 5).</summary>
    public int Score { get; set; }

    /// <summary>Дата и время голосования в UTC.</summary>
    public DateTime CreatedAtUtc { get; set; }
}
