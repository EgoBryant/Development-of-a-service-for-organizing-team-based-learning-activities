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
        await EnsureAssignmentsAsync(dbContext);
    }

    private static async Task EnsureAchievementsAsync(AppDbContext dbContext)
    {
        var existing = await dbContext.Achievements.ToListAsync();
        var existingByCode = existing.ToDictionary(achievement => achievement.Code, achievement => achievement);
        var defaults = new[]
        {
            new Achievement
            {
                Code = AchievementCodes.FirstCheckIn,
                Title = "Первые шаги",
                Description = "Успешно пройдите авторизацию и заполните данные в своём профиле.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.FirstRescue,
                Title = "Рука помощи",
                Description = "Откликнитесь на запрос о помощи от другой команды.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.Top3Team,
                Title = "В игре!",
                Description = "Заработайте первые баллы за задания (не за другие достижения), чтобы попасть в рейтинг.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.FirstVote,
                Title = "Свой круг",
                Description = "Создайте команду или вступите в существующую.",
                IconUrl = string.Empty
            },
            new Achievement
            {
                Code = AchievementCodes.FirstChallenge,
                Title = "Вызов принят",
                Description = "Выполните челлендж и загрузите отчёт.",
                IconUrl = string.Empty
            }
        };

        foreach (var achievement in defaults)
        {
            if (existingByCode.TryGetValue(achievement.Code, out var current))
            {
                current.Title = achievement.Title;
                current.Description = achievement.Description;
                continue;
            }

            dbContext.Achievements.Add(achievement);
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

    private static async Task EnsureAssignmentsAsync(AppDbContext dbContext)
    {
        if (!await dbContext.Assignments.AnyAsync())
        {
            dbContext.Assignments.AddRange(BuildAssignmentCatalog(DateTime.UtcNow.Year));
            await dbContext.SaveChangesAsync();
            return;
        }

        await RemoveLegacySeedAssignmentsAsync(dbContext);
        await SyncAssignmentCatalogAsync(dbContext);
        await ResetAssignmentFeedAvailabilityAsync(dbContext);
    }

    private static async Task ResetAssignmentFeedAvailabilityAsync(AppDbContext dbContext)
    {
        var stuck = await dbContext.Assignments
            .Where(assignment => assignment.IsActive && !assignment.IsAvailableInFeed)
            .ToListAsync();

        if (stuck.Count == 0)
        {
            return;
        }

        foreach (var assignment in stuck)
        {
            assignment.IsAvailableInFeed = true;
        }

        await dbContext.SaveChangesAsync();
    }

    private static readonly HashSet<string> LegacySeedAssignmentTitles = new(StringComparer.Ordinal)
    {
        "Git", "HTML", "Команда", "Markdown", "CSS", "Figma", "GitHub", "Soft Skills", "Спринт", "КРК",
        "Профиль", "JavaScript", "Notion", "Excel", "Scrum", "Чек-лист", "Презентация",
        "Postgres", "C#", "SQL", "Frontend", "TypeScript", "REST", "JWT", "EF Core", "React", "Unit",
        "Swagger", "Docker", "АЛГОРИТМЫ", "DevOps", "Design", "Тестирование", "Microservices",
        "Kubernetes", "Redis", "GraphQL", "Security", "Performance", "System Design", "ML",
        "Python", "МАТАН", "UX/UI"
    };

    private static async Task RemoveLegacySeedAssignmentsAsync(AppDbContext dbContext)
    {
        var legacy = await dbContext.Assignments
            .Where(assignment => LegacySeedAssignmentTitles.Contains(assignment.Title)
                || (assignment.Title == string.Empty && assignment.LeagueTier == "novice"))
            .ToListAsync();

        if (legacy.Count == 0)
        {
            return;
        }

        dbContext.Assignments.RemoveRange(legacy);
        await dbContext.SaveChangesAsync();
    }

    private static async Task SyncAssignmentCatalogAsync(AppDbContext dbContext)
    {
        var year = DateTime.UtcNow.Year;
        var catalog = BuildAssignmentCatalog(year);
        var changed = false;

        foreach (var template in catalog)
        {
            var existing = await dbContext.Assignments
                .FirstOrDefaultAsync(assignment =>
                    assignment.LeagueTier == template.LeagueTier && assignment.Title == template.Title);

            if (existing is null)
            {
                dbContext.Assignments.Add(template);
                changed = true;
                continue;
            }

            if (existing.Tag != template.Tag
                || existing.Description != template.Description
                || existing.DeadlineLabel != template.DeadlineLabel
                || existing.DeadlineUtc != template.DeadlineUtc)
            {
                existing.Tag = template.Tag;
                existing.Description = template.Description;
                existing.DeadlineLabel = template.DeadlineLabel;
                existing.DeadlineUtc = template.DeadlineUtc;
                existing.IsActive = true;
                existing.IsAvailableInFeed = true;
                changed = true;
            }
        }

        if (changed)
        {
            await dbContext.SaveChangesAsync();
        }
    }

    private static IReadOnlyCollection<Assignment> BuildAssignmentCatalog(int year)
    {
        const string backendTag = "#Backend";
        const string frontendTag = "#Frontend&Design";
        const string mathTag = "#Math&Theory";

        return new[]
        {
            // novice — 10 карточек (было 18, убрано 8)
            CreateAssignment("REST API", backendTag, "novice", "03.06 18:00", new DateTime(year, 6, 3, 15, 0, 0, DateTimeKind.Utc),
                "Настройте простой HTTP-эндпоинт и верните JSON с данными команды."),
            CreateAssignment("Git", backendTag, "novice", "04.06 12:00", new DateTime(year, 6, 4, 9, 0, 0, DateTimeKind.Utc),
                "Создайте репозиторий, добавьте README и оформите первый commit."),
            CreateAssignment("PostgreSQL", backendTag, "novice", "05.06 16:00", new DateTime(year, 6, 5, 13, 0, 0, DateTimeKind.Utc),
                "Спроектируйте таблицу участников с полями id, имя и роль."),
            CreateAssignment("HTTP и JSON", backendTag, "novice", "06.06 20:00", new DateTime(year, 6, 6, 17, 0, 0, DateTimeKind.Utc),
                "Опишите структуру JSON-ответа для карточки задания на вкладке «Задания»."),
            CreateAssignment("HTML/CSS", frontendTag, "novice", "07.06 14:00", new DateTime(year, 6, 7, 11, 0, 0, DateTimeKind.Utc),
                "Сверстайте адаптивную карточку задания по макету команды."),
            CreateAssignment("Figma", frontendTag, "novice", "08.06 11:30", new DateTime(year, 6, 8, 8, 30, 0, DateTimeKind.Utc),
                "Соберите макет карточки с тегом, названием и дедлайном."),
            CreateAssignment("Сетка и отступы", frontendTag, "novice", "09.06 17:00", new DateTime(year, 6, 9, 14, 0, 0, DateTimeKind.Utc),
                "Сверстайте сетку из 4 карточек с одинаковыми отступами и скруглениями."),
            CreateAssignment("Предел функции", mathTag, "novice", "10.06 19:00", new DateTime(year, 6, 10, 16, 0, 0, DateTimeKind.Utc),
                "Решите 5 задач на вычисление пределов простых функций."),
            CreateAssignment("Сортировки", mathTag, "novice", "11.06 13:00", new DateTime(year, 6, 11, 10, 0, 0, DateTimeKind.Utc),
                "Реализуйте сортировку выбором и сравните её с bubble sort на примере."),
            CreateAssignment("Матрицы", mathTag, "novice", "12.06 10:00", new DateTime(year, 6, 12, 7, 0, 0, DateTimeKind.Utc),
                "Умножьте две матрицы 3×3 и проверьте результат вручную."),

            // pro — 4 карточки (было 12, убрано 8)
            CreateAssignment("ASP.NET API", backendTag, "pro", "03.06 20:00", new DateTime(year, 6, 3, 17, 0, 0, DateTimeKind.Utc),
                "Напишите REST-сервис на ASP.NET Core с CRUD для сущности «задание»."),
            CreateAssignment("SQL Аналитика", backendTag, "pro", "05.06 23:59", new DateTime(year, 6, 5, 20, 59, 0, DateTimeKind.Utc),
                "Подготовьте 5 SQL-запросов для рейтинга команд и активности участников."),
            CreateAssignment("TypeScript UI", frontendTag, "pro", "06.06 16:30", new DateTime(year, 6, 6, 13, 30, 0, DateTimeKind.Utc),
                "Опишите типы DTO для заданий и реализуйте клиент API с обработкой ошибок."),
            CreateAssignment("Графы", mathTag, "pro", "08.06 19:00", new DateTime(year, 6, 8, 16, 0, 0, DateTimeKind.Utc),
                "Постройте граф зависимостей задач и найдите кратчайший путь между двумя узлами."),

            // legend — 4 карточки (было 12, убрано 8)
            CreateAssignment("Redis", backendTag, "legend", "07.06 11:00", new DateTime(year, 6, 7, 8, 0, 0, DateTimeKind.Utc),
                "Добавьте кеширование ленты заданий и стратегию инвалидации при обновлении."),
            CreateAssignment("UX Архитектура", frontendTag, "legend", "10.06 12:00", new DateTime(year, 6, 10, 9, 0, 0, DateTimeKind.Utc),
                "Проведите UX-исследование вкладки «Задания» и предложите улучшения навигации."),
            CreateAssignment("Оптимизация", mathTag, "legend", "13.06 21:00", new DateTime(year, 6, 13, 18, 0, 0, DateTimeKind.Utc),
                "Оптимизируйте алгоритм выдачи ленты и зафиксируйте метрики до и после изменений."),
            CreateAssignment("System Design", mathTag, "legend", "16.06 19:40", new DateTime(year, 6, 16, 16, 40, 0, DateTimeKind.Utc),
                "Подготовьте схему масштабирования сервиса заданий до 10 000 одновременных пользователей.")
        };
    }

    private static Assignment CreateAssignment(
        string title,
        string tag,
        string leagueTier,
        string deadlineLabel,
        DateTime deadlineUtc,
        string description)
    {
        return new Assignment
        {
            Title = title,
            Tag = tag,
            LeagueTier = leagueTier,
            DeadlineLabel = deadlineLabel,
            DeadlineUtc = deadlineUtc,
            Description = description
        };
    }
}
