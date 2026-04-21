using Microsoft.EntityFrameworkCore;
using TeamExamProject.Models;

namespace TeamExamProject.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Team> Teams => Set<Team>();

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
            entity.HasOne(user => user.Team)
                .WithMany(team => team.Members)
                .HasForeignKey(user => user.TeamId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(team => team.Id);
            entity.Property(team => team.Name).HasMaxLength(150).IsRequired();
            entity.Property(team => team.InviteCode).HasMaxLength(16).IsRequired();
            entity.HasIndex(team => team.InviteCode).IsUnique();
            entity.HasOne(team => team.Captain)
                .WithMany()
                .HasForeignKey(team => team.CaptainUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
