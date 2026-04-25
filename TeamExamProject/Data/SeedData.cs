using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeamExamProject.Models;

namespace TeamExamProject.Data;

public static class SeedData
{
    public const string DemoTeamInviteAlpha = "ALPHA1";
    public const string DemoTeamInviteBeta = "BETA01";

    public static async Task InitializeAsync(AppDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        if (await dbContext.Users.AnyAsync())
        {
            return;
        }

        await RemoveStaleDemoTeamsIfNoUsersAsync(dbContext);

        const string seedGroupTitle = "РИ-420001";
        var group = await dbContext.Groups.FirstOrDefaultAsync(g => g.Title == seedGroupTitle);
        if (group is null)
        {
            group = new Group
            {
                Title = seedGroupTitle,
                Course = "4",
                Faculty = "УрФУ"
            };
            dbContext.Groups.Add(group);
            await dbContext.SaveChangesAsync();
        }

        var admin = new User
        {
            UserName = "Admin",
            Email = "admin@teamexam.local",
            Role = Roles.Admin,
            FirstName = "System",
            LastName = "Admin",
            ContactEmail = "admin@teamexam.local"
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin123!");

        var student = new User
        {
            UserName = "Demo Student",
            Email = "student@teamexam.local",
            Role = Roles.Captain,
            FirstName = "Demo",
            LastName = "Student",
            ContactEmail = "student@teamexam.local",
            StudentTicketNumber = 420001,
            GroupId = group.Id
        };
        student.PasswordHash = passwordHasher.HashPassword(student, "Student123!");

        dbContext.Users.AddRange(admin, student);
        await dbContext.SaveChangesAsync();

        var alpha = new Team
        {
            Name = "Alpha",
            Description = "Demo captain team",
            InviteCode = DemoTeamInviteAlpha,
            Score = 120,
            CaptainId = student.Id
        };

        var beta = new Team
        {
            Name = "Beta",
            Description = "Demo admin team",
            InviteCode = DemoTeamInviteBeta,
            Score = 90,
            CaptainId = admin.Id
        };

        dbContext.Teams.AddRange(alpha, beta);
        await dbContext.SaveChangesAsync();

        student.TeamId = alpha.Id;
        admin.TeamId = beta.Id;
        await dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// После оборванного сида в БД могли остаться демо-команды с уникальными invite, а <see cref="User"/> — пустая.
    /// Удаляем только известные демо-коды, чтобы не получить 23505 на <c>IX_Teams_InviteCode</c>.
    /// </summary>
    private static async Task RemoveStaleDemoTeamsIfNoUsersAsync(AppDbContext dbContext)
    {
        var stale = await dbContext.Teams
            .Where(team => team.InviteCode == DemoTeamInviteAlpha || team.InviteCode == DemoTeamInviteBeta)
            .ToListAsync();

        if (stale.Count == 0)
        {
            return;
        }

        dbContext.Teams.RemoveRange(stale);
        await dbContext.SaveChangesAsync();
    }
}
