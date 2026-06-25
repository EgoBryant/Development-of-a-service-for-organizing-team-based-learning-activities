using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TeamExamProject.Data;

#nullable disable

namespace TeamExamProject.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260624210000_AddAssignmentLeagueAndTag")]
public partial class AddAssignmentLeagueAndTag : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "LeagueTier",
            table: "Assignments",
            type: "character varying(16)",
            maxLength: 16,
            nullable: false,
            defaultValue: "pro");

        migrationBuilder.AddColumn<string>(
            name: "Tag",
            table: "Assignments",
            type: "character varying(64)",
            maxLength: 64,
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateIndex(
            name: "IX_Assignments_LeagueTier",
            table: "Assignments",
            column: "LeagueTier");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Assignments_LeagueTier",
            table: "Assignments");

        migrationBuilder.DropColumn(
            name: "LeagueTier",
            table: "Assignments");

        migrationBuilder.DropColumn(
            name: "Tag",
            table: "Assignments");
    }
}
