using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamExamProject.Migrations;

/// <inheritdoc />
[Migration("20260425120000_FrontendProfileAlignment")]
public partial class FrontendProfileAlignment : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE "Users" ALTER COLUMN "AvatarUrl" TYPE text;
            """);

        migrationBuilder.Sql("""
            ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AcademicGroupLabel" character varying(100) NOT NULL DEFAULT '';
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE "Users" DROP COLUMN IF EXISTS "AcademicGroupLabel";
            """);

        migrationBuilder.Sql("""
            ALTER TABLE "Users" ALTER COLUMN "AvatarUrl" TYPE character varying(500);
            """);
    }
}
