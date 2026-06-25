using Microsoft.EntityFrameworkCore;
using TeamExamProject.Models;

namespace TeamExamProject.Data;

/// <summary>Контекст Entity Framework Core для PostgreSQL — все сущности «Командного зачёта».</summary>
public class AppDbContext : DbContext
{
    /// <summary>Создаёт контекст с параметрами из DI.</summary>
    /// <param name="options">Настройки провайдера и строки подключения.</param>
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    /// <summary>Таблица пользователей.</summary>
    public DbSet<User> Users => Set<User>();
    /// <summary>Таблица команд.</summary>
    public DbSet<Team> Teams => Set<Team>();
    /// <summary>Таблица академических групп.</summary>
    public DbSet<Group> Groups => Set<Group>();
    /// <summary>Таблица объявлений биржи знаний.</summary>
    public DbSet<KnowledgePost> KnowledgePosts => Set<KnowledgePost>();
    /// <summary>Таблица запросов на помощь между командами.</summary>
    public DbSet<HelpRequest> HelpRequests => Set<HelpRequest>();
    /// <summary>Таблица заявок на вступление в команду.</summary>
    public DbSet<TeamJoinRequest> TeamJoinRequests => Set<TeamJoinRequest>();
    /// <summary>Таблица голосов участников.</summary>
    public DbSet<Vote> Votes => Set<Vote>();
    /// <summary>Таблица еженедельных отчётов (check-in).</summary>
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();
    /// <summary>Таблица челленджей.</summary>
    public DbSet<Challenge> Challenges => Set<Challenge>();
    /// <summary>Таблица прогресса команд по челленджам.</summary>
    public DbSet<TeamChallengeProgress> TeamChallengeProgresses => Set<TeamChallengeProgress>();
    /// <summary>Каталог достижений.</summary>
    public DbSet<Achievement> Achievements => Set<Achievement>();
    /// <summary>Связь пользователей с полученными достижениями.</summary>
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();
    /// <summary>Таблица событий игрового календаря.</summary>
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    /// <summary>Таблица новостей организатора.</summary>
    public DbSet<NewsItem> NewsItems => Set<NewsItem>();
<<<<<<< HEAD
    public DbSet<Assignment> Assignments => Set<Assignment>();
=======
    /// <summary>Таблица записей ленты активности.</summary>
>>>>>>> 3d578392bfadbd52fcf244fda5c70c5433a7e4dc
    public DbSet<ActivityFeedItem> ActivityFeedItems => Set<ActivityFeedItem>();

    /// <summary>Настраивает схему, индексы и связи между сущностями.</summary>
    /// <param name="modelBuilder">Построитель модели EF Core.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Email).HasMaxLength(200).IsRequired();
            entity.Property(user => user.UserName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.PasswordHash).IsRequired();
            entity.Property(user => user.Role).HasMaxLength(50).IsRequired();
            entity.Property(user => user.FirstName).HasMaxLength(100);
            entity.Property(user => user.LastName).HasMaxLength(100);
            entity.Property(user => user.MiddleName).HasMaxLength(100);
            entity.Property(user => user.Nickname).HasMaxLength(100);
            entity.Property(user => user.Bio).HasMaxLength(1000);
            entity.Property(user => user.AvatarUrl).HasColumnType("text");
            entity.Property(user => user.AcademicGroupLabel).HasMaxLength(100);
            entity.Property(user => user.ContactEmail).HasMaxLength(200);
            entity.Property(user => user.TelegramHandle).HasMaxLength(100);
            entity.Property(user => user.PhoneNumber).HasMaxLength(32);
            entity.Property(user => user.UserPoints).HasDefaultValue(0);
            entity.HasIndex(user => user.StudentTicketNumber).IsUnique();
            entity.HasIndex(user => user.UserPoints);
            entity.HasOne(user => user.Group)
                .WithMany(group => group.Users)
                .HasForeignKey(user => user.GroupId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(user => user.Team)
                .WithMany(team => team.Members)
                .HasForeignKey(user => user.TeamId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(team => team.Id);
            entity.Property(team => team.Name).HasMaxLength(150).IsRequired();
            entity.Property(team => team.Description).HasMaxLength(1000);
            entity.Property(team => team.InviteCode).HasMaxLength(16).IsRequired();
            entity.Property(team => team.KrkCached).HasDefaultValue(0d);
            entity.HasIndex(team => team.InviteCode).IsUnique();
            entity.HasIndex(team => team.CaptainId).IsUnique();
            entity.HasIndex(team => team.Score);
            entity.HasOne(team => team.Captain)
                .WithMany()
                .HasForeignKey(team => team.CaptainId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TeamJoinRequest>(entity =>
        {
            entity.HasKey(request => request.Id);
            entity.Property(request => request.Message).HasMaxLength(1000);
            entity.Property(request => request.Status).HasMaxLength(32).IsRequired();
            entity.HasIndex(request => request.Status);
            entity.HasIndex(request => request.CreatedAtUtc);
            entity.HasIndex(request => new { request.TeamId, request.UserId, request.Status });
            entity.HasIndex(request => new { request.TeamId, request.UserId })
                .IsUnique()
                .HasFilter("\"Status\" = 'Pending'");
            entity.HasOne(request => request.Team)
                .WithMany(team => team.JoinRequests)
                .HasForeignKey(request => request.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(request => request.User)
                .WithMany(user => user.TeamJoinRequests)
                .HasForeignKey(request => request.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(request => request.DecidedByUser)
                .WithMany()
                .HasForeignKey(request => request.DecidedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(group => group.Id);
            entity.Property(group => group.Title).HasMaxLength(100).IsRequired();
            entity.Property(group => group.Course).HasMaxLength(32).IsRequired();
            entity.Property(group => group.Faculty).HasMaxLength(150).IsRequired();
            entity.HasIndex(group => group.Title).IsUnique();
        });

        modelBuilder.Entity<KnowledgePost>(entity =>
        {
            entity.HasKey(post => post.Id);
            entity.Property(post => post.Title).HasMaxLength(200).IsRequired();
            entity.Property(post => post.Description).HasMaxLength(2000).IsRequired();
            entity.Property(post => post.Type).HasMaxLength(50).IsRequired();
            entity.HasIndex(post => post.Type);
            entity.HasOne(post => post.User)
                .WithMany(user => user.KnowledgePosts)
                .HasForeignKey(post => post.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(post => post.Team)
                .WithMany(team => team.KnowledgePosts)
                .HasForeignKey(post => post.TeamId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<HelpRequest>(entity =>
        {
            entity.HasKey(request => request.Id);
            entity.Property(request => request.Topic).HasMaxLength(200);
            entity.Property(request => request.Tag).HasMaxLength(100);
            entity.Property(request => request.Description).HasMaxLength(2000).IsRequired();
            entity.Property(request => request.Format).HasMaxLength(50);
            entity.Property(request => request.LeagueLabel).HasMaxLength(50);
            entity.Property(request => request.Status).HasMaxLength(32).IsRequired();
            entity.HasIndex(request => request.Status);
            entity.HasOne(request => request.FromTeam)
                .WithMany(team => team.OutgoingHelpRequests)
                .HasForeignKey(request => request.FromTeamId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(request => request.ToTeam)
                .WithMany(team => team.IncomingHelpRequests)
                .HasForeignKey(request => request.ToTeamId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Vote>(entity =>
        {
            entity.HasKey(vote => vote.Id);
            entity.HasIndex(vote => new { vote.TeamId, vote.FromUserId, vote.ToUserId }).IsUnique();
            entity.HasOne(vote => vote.Team)
                .WithMany(team => team.Votes)
                .HasForeignKey(vote => vote.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(vote => vote.FromUser)
                .WithMany(user => user.OutgoingVotes)
                .HasForeignKey(vote => vote.FromUserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(vote => vote.ToUser)
                .WithMany(user => user.IncomingVotes)
                .HasForeignKey(vote => vote.ToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CheckIn>(entity =>
        {
            entity.HasKey(checkIn => checkIn.Id);
            entity.Property(checkIn => checkIn.ReportText).HasMaxLength(4000).IsRequired();
            entity.Property(checkIn => checkIn.Status).HasMaxLength(32).IsRequired();
            entity.HasIndex(checkIn => new { checkIn.TeamId, checkIn.WeekNumber }).IsUnique();
            entity.HasOne(checkIn => checkIn.Team)
                .WithMany(team => team.CheckIns)
                .HasForeignKey(checkIn => checkIn.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Challenge>(entity =>
        {
            entity.HasKey(challenge => challenge.Id);
            entity.Property(challenge => challenge.Title).HasMaxLength(200).IsRequired();
            entity.Property(challenge => challenge.Description).HasMaxLength(2000).IsRequired();
            entity.HasIndex(challenge => challenge.IsActive);
        });

        modelBuilder.Entity<TeamChallengeProgress>(entity =>
        {
            entity.HasKey(progress => progress.Id);
            entity.Property(progress => progress.ProofText).HasMaxLength(2000);
            entity.Property(progress => progress.Status).HasMaxLength(32).IsRequired();
            entity.HasIndex(progress => new { progress.ChallengeId, progress.TeamId, progress.Status });
            entity.HasOne(progress => progress.Challenge)
                .WithMany(challenge => challenge.Progress)
                .HasForeignKey(progress => progress.ChallengeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(progress => progress.Team)
                .WithMany(team => team.ChallengeProgress)
                .HasForeignKey(progress => progress.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(progress => progress.SubmittedByUser)
                .WithMany()
                .HasForeignKey(progress => progress.SubmittedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Achievement>(entity =>
        {
            entity.HasKey(achievement => achievement.Id);
            entity.Property(achievement => achievement.Code).HasMaxLength(64).IsRequired();
            entity.Property(achievement => achievement.Title).HasMaxLength(200).IsRequired();
            entity.Property(achievement => achievement.Description).HasMaxLength(1000);
            entity.Property(achievement => achievement.IconUrl).HasColumnType("text");
            entity.HasIndex(achievement => achievement.Code).IsUnique();
        });

        modelBuilder.Entity<UserAchievement>(entity =>
        {
            entity.HasKey(userAchievement => userAchievement.Id);
            entity.HasIndex(userAchievement => new { userAchievement.UserId, userAchievement.AchievementId }).IsUnique();
            entity.HasOne(userAchievement => userAchievement.User)
                .WithMany(user => user.Achievements)
                .HasForeignKey(userAchievement => userAchievement.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(userAchievement => userAchievement.Achievement)
                .WithMany(achievement => achievement.Holders)
                .HasForeignKey(userAchievement => userAchievement.AchievementId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CalendarEvent>(entity =>
        {
            entity.HasKey(calendarEvent => calendarEvent.Id);
            entity.Property(calendarEvent => calendarEvent.Topic).HasMaxLength(200).IsRequired();
            entity.Property(calendarEvent => calendarEvent.Tag).HasMaxLength(100);
            entity.Property(calendarEvent => calendarEvent.Description).HasMaxLength(2000);
            entity.Property(calendarEvent => calendarEvent.Format).HasMaxLength(50);
            entity.HasIndex(calendarEvent => calendarEvent.StartsAtUtc);
            entity.HasOne(calendarEvent => calendarEvent.Team)
                .WithMany()
                .HasForeignKey(calendarEvent => calendarEvent.TeamId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(calendarEvent => calendarEvent.CreatedByUser)
                .WithMany()
                .HasForeignKey(calendarEvent => calendarEvent.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<NewsItem>(entity =>
        {
            entity.HasKey(news => news.Id);
            entity.Property(news => news.Title).HasMaxLength(200).IsRequired();
            entity.Property(news => news.Body).HasMaxLength(4000).IsRequired();
            entity.HasIndex(news => news.PublishedAtUtc);
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(assignment => assignment.Id);
            entity.Property(assignment => assignment.Title).HasMaxLength(200).IsRequired();
            entity.Property(assignment => assignment.Tag).HasMaxLength(64).IsRequired();
            entity.Property(assignment => assignment.Description).HasMaxLength(4000).IsRequired();
            entity.Property(assignment => assignment.DeadlineLabel).HasMaxLength(64).IsRequired();
            entity.Property(assignment => assignment.LeagueTier).HasMaxLength(16).IsRequired();
            entity.HasIndex(assignment => assignment.IsActive);
            entity.HasIndex(assignment => assignment.IsAvailableInFeed);
            entity.HasIndex(assignment => assignment.DeadlineUtc);
            entity.HasIndex(assignment => assignment.LeagueTier);
        });

        modelBuilder.Entity<ActivityFeedItem>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Type).HasMaxLength(64).IsRequired();
            entity.Property(item => item.Message).HasMaxLength(500).IsRequired();
            entity.HasIndex(item => item.CreatedAtUtc);
            entity.HasOne(item => item.Team)
                .WithMany()
                .HasForeignKey(item => item.TeamId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(item => item.User)
                .WithMany()
                .HasForeignKey(item => item.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
