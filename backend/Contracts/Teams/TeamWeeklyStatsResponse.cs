namespace TeamExamProject.Contracts.Teams;

public class TeamWeeklyStatsResponse
{
    public int PointsEarned { get; set; }
    public int TeamsRescued { get; set; }
    public int EventsHeld { get; set; }
    public DateTime WeekStartUtc { get; set; }
    public DateTime WeekEndUtc { get; set; }
}
