namespace TeamExamProject.Models;

/// <summary>Допустимые статусы запроса на помощь («спасение»).</summary>
public static class HelpRequestStatuses
{
    /// <summary>Запрос открыт и ожидает отклика.</summary>
    public const string Open = "Open";
    /// <summary>Запрос принят другой командой.</summary>
    public const string Accepted = "Accepted";
    /// <summary>Запрос отклонён.</summary>
    public const string Rejected = "Rejected";
    /// <summary>Помощь оказана, запрос завершён.</summary>
    public const string Completed = "Completed";
}
