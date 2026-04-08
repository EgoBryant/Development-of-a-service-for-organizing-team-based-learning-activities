using TeamExamProject.Models;

namespace TeamExamProject.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext dbContext)
    {
        if (!dbContext.Teams.Any())
        {
            dbContext.Teams.AddRange(
                new Team { Name = "Alpha", Score = 0 },
                new Team { Name = "Beta", Score = 0 });
        }

        await dbContext.SaveChangesAsync();
    }
}
