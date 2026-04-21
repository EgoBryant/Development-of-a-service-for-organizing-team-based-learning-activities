using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeamExamProject.Models;

namespace TeamExamProject.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        if (await dbContext.Users.AnyAsync())
        {
            return;
        }

        var admin = new User
        {
            UserName = "Admin",
            Email = "admin@teamexam.local",
            Role = Roles.Admin
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin123!");

        var student = new User
        {
            UserName = "Demo Student",
            Email = "student@teamexam.local"
        };
        student.PasswordHash = passwordHasher.HashPassword(student, "Student123!");

        dbContext.Users.AddRange(admin, student);
        await dbContext.SaveChangesAsync();

        var alpha = new Team
        {
            Name = "Alpha",
            InviteCode = "ALPHA1",
            Score = 120,
            CaptainUserId = student.Id
        };

        var beta = new Team
        {
            Name = "Beta",
            InviteCode = "BETA01",
            Score = 90,
            CaptainUserId = admin.Id
        };

        dbContext.Teams.AddRange(alpha, beta);
        await dbContext.SaveChangesAsync();

        student.TeamId = alpha.Id;
        admin.TeamId = beta.Id;
        await dbContext.SaveChangesAsync();
    }
}
