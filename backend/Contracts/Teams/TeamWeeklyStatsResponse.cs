namespace TeamExamProject.Contracts.Teams;

/// <summary>
/// Еженедельная сводная статистика команды для дашборда и отчётов.
/// </summary>
public class TeamWeeklyStatsResponse
{
    /// <summary>Количество очков, заработанных командой за неделю.</summary>
    public int PointsEarned { get; set; }

    /// <summary>Количество команд, которым команда оказала помощь («спасение»).</summary>
    public int TeamsRescued { get; set; }

    /// <summary>Количество проведённых командных мероприятий за неделю.</summary>
    public int EventsHeld { get; set; }

    /// <summary>Начало отчётной недели в UTC.</summary>
    public DateTime WeekStartUtc { get; set; }

    /// <summary>Конец отчётной недели в UTC.</summary>
    public DateTime WeekEndUtc { get; set; }
}
