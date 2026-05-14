using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace TeamExamProject.Data;

/// <summary>
/// Идемпотентные SQL-правки на случай рассинхрона <c>__EFMigrationsHistory</c> и реальной схемы PostgreSQL
/// (миграция в истории есть, DDL не выполнялся).
/// </summary>
public static class DatabaseSchemaRepair
{
    public static async Task ApplyAsync(AppDbContext dbContext, ILogger logger, CancellationToken cancellationToken = default)
    {
        await EnsureUsersProfileColumnsAsync(dbContext, logger, cancellationToken);
    }

    private static async Task EnsureUsersProfileColumnsAsync(
        AppDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AcademicGroupLabel" character varying(100) NOT NULL DEFAULT '';
            """,
            cancellationToken);

        try
        {
            await dbContext.Database.ExecuteSqlRawAsync(
                """
                ALTER TABLE "Users" ALTER COLUMN "AvatarUrl" TYPE text;
                """,
                cancellationToken);
        }
        catch (PostgresException ex)
        {
            logger.LogWarning(ex, "Could not alter Users.AvatarUrl to text (may already be text). SqlState={SqlState}", ex.SqlState);
        }
    }
}
