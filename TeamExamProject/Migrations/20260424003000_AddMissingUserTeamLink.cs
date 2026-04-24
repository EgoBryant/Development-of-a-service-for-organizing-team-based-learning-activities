using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamExamProject.Migrations
{
    /// <inheritdoc />
    [Migration("20260424003000_AddMissingUserTeamLink")]
    public partial class AddMissingUserTeamLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "TeamId" integer NULL;
                """);

            migrationBuilder.Sql("""
                CREATE INDEX IF NOT EXISTS "IX_Users_TeamId" ON "Users" ("TeamId");
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Users_Teams_TeamId'
                    ) THEN
                        ALTER TABLE "Users"
                        ADD CONSTRAINT "FK_Users_Teams_TeamId"
                        FOREIGN KEY ("TeamId") REFERENCES "Teams" ("Id")
                        ON DELETE SET NULL;
                    END IF;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "FK_Users_Teams_TeamId";
                DROP INDEX IF EXISTS "IX_Users_TeamId";
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "TeamId";
                """);
        }
    }
}
