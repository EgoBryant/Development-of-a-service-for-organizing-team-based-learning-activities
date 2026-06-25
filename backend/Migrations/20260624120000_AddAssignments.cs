using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using TeamExamProject.Data;

#nullable disable

namespace TeamExamProject.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260624120000_AddAssignments")]
public partial class AddAssignments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Assignments",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                DeadlineLabel = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                DeadlineUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                IsAvailableInFeed = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Assignments", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Assignments_DeadlineUtc",
            table: "Assignments",
            column: "DeadlineUtc");

        migrationBuilder.CreateIndex(
            name: "IX_Assignments_IsActive",
            table: "Assignments",
            column: "IsActive");

        migrationBuilder.CreateIndex(
            name: "IX_Assignments_IsAvailableInFeed",
            table: "Assignments",
            column: "IsAvailableInFeed");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Assignments");
    }
}
