using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeamExamProject.Models;

namespace TeamExamProject.Data;

public static class SeedData
{
    public const string DemoTeamInviteAlpha = "ALPHA1";
    public const string DemoTeamInviteBeta = "BETA01";
    public const string DemoTeamInviteGamma = "GAMMA1";

    public static async Task InitializeAsync(AppDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        await EnsureAchievementsAsync(dbContext);
        await EnsureChallengesAsync(dbContext);
        await EnsureNewsAsync(dbContext);

        if (await dbContext.Users.AnyAsync())
        {
            return;
        }

        await RemoveStaleDemoTeamsIfNoUsersAsync(dbContext);

        const string seedGroupTitle = "РИ-420001";
        var group = await dbContext.Groups.FirstOrDefaultAsync(existing => existing.Title == seedGroupTitle);
        if (group is null)
        {
            group = new Group { Title = seedGroupTitle, Course = "4", Faculty = "УрФУ" };
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
            ContactEmail = "admin@teamexam.local",
            UserPoints = 0
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin123!");

        var captainAlpha = new User
        {
            UserName = "Ivanov",
            Email = "ivanov@teamexam.local",
            Role = Roles.Captain,
            FirstName = "Иван",
            LastName = "Иванов",
            ContactEmail = "ivanov@teamexam.local",
            StudentTicketNumber = 420001,
            GroupId = group.Id,
            UserPoints = 420
        };
        captainAlpha.PasswordHash = passwordHasher.HashPassword(captainAlpha, "Captain123!");

        var memberAlpha = new User
        {
            UserName = "Kozlov",
            Email = "kozlov@teamexam.local",
            Role = Roles.Student,
            FirstName = "Кирилл",
            LastName = "Козлов",
            GroupId = group.Id,
            StudentTicketNumber = 420002,
            UserPoints = 360
        };
        memberAlpha.PasswordHash = passwordHasher.HashPassword(memberAlpha, "Student123!");

        var captainBeta = new User
        {
            UserName = "Petrov",
            Email = "petrov@teamexam.local",
            Role = Roles.Captain,
            FirstName = "Пётр",
            LastName = "Петров",
            ContactEmail = "petrov@teamexam.local",
            StudentTicketNumber = 420003,
            GroupId = group.Id,
            UserPoints = 405
        };
        captainBeta.PasswordHash = passwordHasher.HashPassword(captainBeta, "Captain123!");

        var memberBeta = new User
        {
            UserName = "Novikov",
            Email = "novikov@teamexam.local",
            Role = Roles.Student,
            FirstName = "Никита",
            LastName = "Новиков",
            StudentTicketNumber = 420004,
            GroupId = group.Id,
            UserPoints = 340
        };
        memberBeta.PasswordHash = passwordHasher.HashPassword(memberBeta, "Student123!");

        var captainGamma = new User
        {
            UserName = "Sidorov",
            Email = "sidorov@teamexam.local",
            Role = Roles.Captain,
            FirstName = "Сергей",
            LastName = "Сидоров",
            ContactEmail = "sidorov@teamexam.local",
            StudentTicketNumber = 420005,
            GroupId = group.Id,
            UserPoints = 390
        };
        captainGamma.PasswordHash = passwordHasher.HashPassword(captainGamma, "Captain123!");

        var freeUser = new User
        {
            UserName = "Volkov",
            Email = "volkov@teamexam.local",
            Role = Roles.Student,
            FirstName = "Владимир",
            LastName = "Волков",
            StudentTicketNumber = 420006,
            GroupId = group.Id,
            UserPoints = 310
        };
        freeUser.PasswordHash = passwordHasher.HashPassword(freeUser, "Student123!");

        dbContext.Users.AddRange(admin, captainAlpha, memberAlpha, captainBeta, memberBeta, captainGamma, freeUser);
        await dbContext.SaveChangesAsync();

        var alpha = new Team
        {
            Name = "КОМАНДА АЛЬФА",
            Description = "Demo captain team",
            InviteCode = DemoTeamInviteAlpha,
            Score = 1240,
            CaptainId = captainAlpha.Id
        };
        var beta = new Team
        {
            Name = "КОМАНДА БЕТА",
            Description = "Demo team",
            InviteCode = DemoTeamInviteBeta,
            Score = 1180,
            CaptainId = captainBeta.Id
        };
        var gamma = new Team
        {
            Name = "КОМАНДА ГАММА",
            Description = "Demo team",
            InviteCode = DemoTeamInviteGamma,
            Score = 1095,
            CaptainId = captainGamma.Id
        };

        dbContext.Teams.AddRange(alpha, beta, gamma);
        await dbContext.SaveChangesAsync();

        captainAlpha.TeamId = alpha.Id;
        memberAlpha.TeamId = alpha.Id;
        captainBeta.TeamId = beta.Id;
        memberBeta.TeamId = beta.Id;
        captainGamma.TeamId = gamma.Id;
        admin.TeamId = beta.Id; // admin для удобства проверки прав модерации.
        await dbContext.SaveChangesAsync();
    }

    private static async Task EnsureAchievementsAsync(AppDbContext dbContext)
    {
        var existingCodes = await dbContext.Achievements.Select(achievement => achievement.Code).ToListAsync();
        var defaults = new[]
        {
            new Achievement
            {
                Code = AchievementCodes.FirstCheckIn,
                Title = "Первый check-in",
                Description = "Капитан сдал первый еженедельный отчёт команды.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.FirstRescue,
                Title = "Первое спасение",
                Description = "Команда успешно помогла другой команде.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.Top3Team,
                Title = "Топ-3 команды",
                Description = "Команда зашла в тройку лидеров.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.FirstVote,
                Title = "Голос команды",
                Description = "Игрок впервые проголосовал за тиммейта.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.FirstChallenge,
                Title = "Челлендж принят",
                Description = "Команда сдала первый челлендж.",
                IconUrl = string.Empty
            }
        };

        foreach (var achievement in defaults)
        {
            if (!existingCodes.Contains(achievement.Code))
            {
                dbContext.Achievements.Add(achievement);
            }
        }
        await dbContext.SaveChangesAsync();
    }

    private static async Task EnsureChallengesAsync(AppDbContext dbContext)
    {
        if (await dbContext.Challenges.AnyAsync())
        {
            return;
        }

        dbContext.Challenges.AddRange(
            new Challenge
            {
                Title = "Собери команду из 4 человек",
                Description = "Запишите в команду минимум 4 студентов своей группы.",
                BonusPoints = 30,
                IsActive = true
            },
            new Challenge
            {
                Title = "Сдай 3 check-in подряд",
                Description = "Капитан сдаёт три еженедельных отчёта подряд без пропусков.",
                BonusPoints = 50,
                IsActive = true
            },
            new Challenge
            {
                Title = "Помоги другой команде",
                Description = "Завершите как минимум одно «спасение» для другой команды.",
                BonusPoints = 40,
                IsActive = true
            },
            new Challenge
            {
                Title = "Опубликуй 2 объявления в Бирже знаний",
                Description = "Команда публикует 2 экспертных объявления.",
                BonusPoints = 25,
                IsActive = true
            },
            new Challenge
            {
                Title = "Закройте сессию без долгов",
                Description = "Все участники команды сдали зачётную неделю без задолженностей.",
                BonusPoints = 100,
                IsActive = true
            }
        );
        await dbContext.SaveChangesAsync();
    }

    private static async Task EnsureNewsAsync(AppDbContext dbContext)
    {
        if (await dbContext.NewsItems.AnyAsync())
        {
            return;
        }

        dbContext.NewsItems.AddRange(
            new NewsItem
            {
                Title = "Старт сезона «Командный зачёт»",
                Body = "Сезон открыт. Команды могут создавать профили и приглашать игроков по invite code.",
                PublishedAtUtc = DateTime.UtcNow.AddDays(-3)
            },
            new NewsItem
            {
                Title = "Запущена биржа знаний",
                Body = "Теперь любой студент может опубликовать запрос или предложение экспертизы.",
                PublishedAtUtc = DateTime.UtcNow.AddDays(-1)
            }
        );
        await dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// После оборванного сида в БД могли остаться демо-команды с уникальными invite, а <see cref="User"/> — пустая.
    /// Удаляем только известные демо-коды, чтобы не получить 23505 на <c>IX_Teams_InviteCode</c>.
    /// </summary>
    private static async Task RemoveStaleDemoTeamsIfNoUsersAsync(AppDbContext dbContext)
    {
        var stale = await dbContext.Teams
            .Where(team => team.InviteCode == DemoTeamInviteAlpha
                           || team.InviteCode == DemoTeamInviteBeta
                           || team.InviteCode == DemoTeamInviteGamma)
            .ToListAsync();

        if (stale.Count == 0)
        {
            return;
        }

        dbContext.Teams.RemoveRange(stale);
        await dbContext.SaveChangesAsync();
    }
}
