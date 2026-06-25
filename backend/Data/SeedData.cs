using Microsoft.EntityFrameworkCore;
using TeamExamProject.Models;

namespace TeamExamProject.Data;

/// <summary>Начальное заполнение справочников и демо-данных при старте приложения.</summary>
public static class SeedData
{
    /// <summary>Добавляет отсутствующие достижения, челленджи и новости в БД.</summary>
    /// <param name="dbContext">Контекст базы данных.</param>
    public static async Task InitializeAsync(AppDbContext dbContext)
    {
        await EnsureAchievementsAsync(dbContext);
        await EnsureChallengesAsync(dbContext);
        await EnsureNewsAsync(dbContext);
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
}
