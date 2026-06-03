using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using TeamExamProject.Data;

#nullable disable

namespace TeamExamProject.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260603090000_AddTeamJoinRequests")]
public partial class AddTeamJoinRequests : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "TeamJoinRequests",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                TeamId = table.Column<int>(type: "integer", nullable: false),
                UserId = table.Column<int>(type: "integer", nullable: false),
                Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                DecidedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                DecidedByUserId = table.Column<int>(type: "integer", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TeamJoinRequests", x => x.Id);
                table.ForeignKey(
                    name: "FK_TeamJoinRequests_Teams_TeamId",
                    column: x => x.TeamId,
                    principalTable: "Teams",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_TeamJoinRequests_Users_DecidedByUserId",
                    column: x => x.DecidedByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_TeamJoinRequests_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_TeamJoinRequests_CreatedAtUtc",
            table: "TeamJoinRequests",
            column: "CreatedAtUtc");

        migrationBuilder.CreateIndex(
            name: "IX_TeamJoinRequests_DecidedByUserId",
            table: "TeamJoinRequests",
            column: "DecidedByUserId");

        migrationBuilder.CreateIndex(
            name: "IX_TeamJoinRequests_Status",
            table: "TeamJoinRequests",
            column: "Status");

        migrationBuilder.CreateIndex(
            name: "IX_TeamJoinRequests_TeamId_UserId",
            table: "TeamJoinRequests",
            columns: new[] { "TeamId", "UserId" },
            unique: true,
            filter: "\"Status\" = 'Pending'");

        migrationBuilder.CreateIndex(
            name: "IX_TeamJoinRequests_TeamId_UserId_Status",
            table: "TeamJoinRequests",
            columns: new[] { "TeamId", "UserId", "Status" });

        migrationBuilder.CreateIndex(
            name: "IX_TeamJoinRequests_UserId",
            table: "TeamJoinRequests",
            column: "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "TeamJoinRequests");
    }
}
