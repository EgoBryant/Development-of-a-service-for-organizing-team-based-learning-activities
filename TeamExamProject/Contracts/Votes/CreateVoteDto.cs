using System.ComponentModel.DataAnnotations;

namespace TeamExamProject.Contracts.Votes;

public class CreateVoteDto
{
    [Range(1, int.MaxValue)]
    public int ToUserId { get; set; }

    [Range(1, 5)]
    public int Score { get; set; }
}
