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

        var group = new Group
        {
            Title = "РИ-420001",
            Course = "4",
            Faculty = "УрФУ"
        };

        dbContext.Groups.Add(group);
        await dbContext.SaveChangesAsync();

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
            InviteCode = "ALPHA1",
            Score = 120,
            CaptainId = student.Id
        };

        var beta = new Team
        {
            Name = "Beta",
            Description = "Demo admin team",
            InviteCode = "BETA01",
            Score = 90,
            CaptainId = admin.Id
        };

        dbContext.Teams.AddRange(alpha, beta);
        await dbContext.SaveChangesAsync();

        student.TeamId = alpha.Id;
        admin.TeamId = beta.Id;
        await dbContext.SaveChangesAsync();
    }
}
