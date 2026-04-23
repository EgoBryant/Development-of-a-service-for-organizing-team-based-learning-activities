using Microsoft.EntityFrameworkCore;
using TeamExamProject.Models;

namespace TeamExamProject.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<KnowledgePost> KnowledgePosts => Set<KnowledgePost>();
    public DbSet<HelpRequest> HelpRequests => Set<HelpRequest>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();

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
            entity.Property(user => user.AvatarUrl).HasMaxLength(500);
            entity.Property(user => user.ContactEmail).HasMaxLength(200);
            entity.Property(user => user.TelegramHandle).HasMaxLength(100);
            entity.Property(user => user.PhoneNumber).HasMaxLength(32);
            entity.HasIndex(user => user.StudentTicketNumber).IsUnique();
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
            entity.HasIndex(team => team.InviteCode).IsUnique();
            entity.HasIndex(team => team.CaptainId).IsUnique();
            entity.HasOne(team => team.Captain)
                .WithMany()
                .HasForeignKey(team => team.CaptainId)
                .OnDelete(DeleteBehavior.Restrict);
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
            entity.Property(request => request.Description).HasMaxLength(2000).IsRequired();
            entity.Property(request => request.Status).HasMaxLength(32).IsRequired();
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
            entity.HasIndex(checkIn => new { checkIn.TeamId, checkIn.WeekNumber }).IsUnique();
            entity.HasOne(checkIn => checkIn.Team)
                .WithMany(team => team.CheckIns)
                .HasForeignKey(checkIn => checkIn.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
