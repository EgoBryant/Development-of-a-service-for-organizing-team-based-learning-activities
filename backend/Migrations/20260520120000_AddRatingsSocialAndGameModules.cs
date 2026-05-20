using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TeamExamProject.Migrations;

/// <inheritdoc />
public partial class AddRatingsSocialAndGameModules : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // === Users: рейтинговые поля + SaaS-расширение ===
        migrationBuilder.AddColumn<int>(
            name: "UserPoints",
            table: "Users",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<int>(
            name: "InstituteId",
            table: "Users",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Users_UserPoints",
            table: "Users",
            column: "UserPoints");

        // === Teams: KRK cache + SaaS-расширение ===
        migrationBuilder.AddColumn<double>(
            name: "KrkCached",
            table: "Teams",
            type: "double precision",
            nullable: false,
            defaultValue: 0d);

        migrationBuilder.AddColumn<DateTime>(
            name: "KrkCachedAtUtc",
            table: "Teams",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "InstituteId",
            table: "Teams",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "GameSeasonId",
            table: "Teams",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Teams_Score",
            table: "Teams",
            column: "Score");

        // === HelpRequests: поля под RescueDraft / TeamRescueDraft ===
        migrationBuilder.AddColumn<string>(
            name: "Topic",
            table: "HelpRequests",
            type: "character varying(200)",
            maxLength: 200,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "Tag",
            table: "HelpRequests",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "Format",
            table: "HelpRequests",
            type: "character varying(50)",
            maxLength: 50,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "LeagueLabel",
            table: "HelpRequests",
            type: "character varying(50)",
            maxLength: 50,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<DateTime>(
            name: "ScheduledAtUtc",
            table: "HelpRequests",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "BonusAwarded",
            table: "HelpRequests",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.CreateIndex(
            name: "IX_HelpRequests_Status",
            table: "HelpRequests",
            column: "Status");

        // === CheckIns: статус + submittedAtUtc ===
        migrationBuilder.AddColumn<string>(
            name: "Status",
            table: "CheckIns",
            type: "character varying(32)",
            maxLength: 32,
            nullable: false,
            defaultValue: "Submitted");

        migrationBuilder.AddColumn<DateTime>(
            name: "SubmittedAtUtc",
            table: "CheckIns",
            type: "timestamp with time zone",
            nullable: true);

        // === KnowledgePosts: индекс по тегу/типу ===
        migrationBuilder.CreateIndex(
            name: "IX_KnowledgePosts_Type",
            table: "KnowledgePosts",
            column: "Type");

        // === Challenges + TeamChallengeProgress ===
        migrationBuilder.CreateTable(
            name: "Challenges",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                BonusPoints = table.Column<int>(type: "integer", nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                StartsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                EndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                InstituteId = table.Column<int>(type: "integer", nullable: true),
                GameSeasonId = table.Column<int>(type: "integer", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Challenges", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Challenges_IsActive",
            table: "Challenges",
            column: "IsActive");

        migrationBuilder.CreateTable(
            name: "TeamChallengeProgresses",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                ChallengeId = table.Column<int>(type: "integer", nullable: false),
                TeamId = table.Column<int>(type: "integer", nullable: false),
                SubmittedByUserId = table.Column<int>(type: "integer", nullable: false),
                ProofText = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                SubmittedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                ReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TeamChallengeProgresses", x => x.Id);
                table.ForeignKey(
                    name: "FK_TeamChallengeProgresses_Challenges_ChallengeId",
                    column: x => x.ChallengeId,
                    principalTable: "Challenges",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_TeamChallengeProgresses_Teams_TeamId",
                    column: x => x.TeamId,
                    principalTable: "Teams",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_TeamChallengeProgresses_Users_SubmittedByUserId",
                    column: x => x.SubmittedByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_TeamChallengeProgresses_ChallengeId_TeamId_Status",
            table: "TeamChallengeProgresses",
            columns: new[] { "ChallengeId", "TeamId", "Status" });

        migrationBuilder.CreateIndex(
            name: "IX_TeamChallengeProgresses_TeamId",
            table: "TeamChallengeProgresses",
            column: "TeamId");

        migrationBuilder.CreateIndex(
            name: "IX_TeamChallengeProgresses_SubmittedByUserId",
            table: "TeamChallengeProgresses",
            column: "SubmittedByUserId");

        // === Achievements + UserAchievements ===
        migrationBuilder.CreateTable(
            name: "Achievements",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                IconUrl = table.Column<string>(type: "text", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Achievements", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Achievements_Code",
            table: "Achievements",
            column: "Code",
            unique: true);

        migrationBuilder.CreateTable(
            name: "UserAchievements",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                UserId = table.Column<int>(type: "integer", nullable: false),
                AchievementId = table.Column<int>(type: "integer", nullable: false),
                EarnedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserAchievements", x => x.Id);
                table.ForeignKey(
                    name: "FK_UserAchievements_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_UserAchievements_Achievements_AchievementId",
                    column: x => x.AchievementId,
                    principalTable: "Achievements",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_UserAchievements_UserId_AchievementId",
            table: "UserAchievements",
            columns: new[] { "UserId", "AchievementId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_UserAchievements_AchievementId",
            table: "UserAchievements",
            column: "AchievementId");

        // === CalendarEvents ===
        migrationBuilder.CreateTable(
            name: "CalendarEvents",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Topic = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Tag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                Format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                StartsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                IsGlobal = table.Column<bool>(type: "boolean", nullable: false),
                TeamId = table.Column<int>(type: "integer", nullable: true),
                CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                InstituteId = table.Column<int>(type: "integer", nullable: true),
                GameSeasonId = table.Column<int>(type: "integer", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CalendarEvents", x => x.Id);
                table.ForeignKey(
                    name: "FK_CalendarEvents_Teams_TeamId",
                    column: x => x.TeamId,
                    principalTable: "Teams",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_CalendarEvents_Users_CreatedByUserId",
                    column: x => x.CreatedByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_CalendarEvents_StartsAtUtc",
            table: "CalendarEvents",
            column: "StartsAtUtc");

        migrationBuilder.CreateIndex(
            name: "IX_CalendarEvents_TeamId",
            table: "CalendarEvents",
            column: "TeamId");

        migrationBuilder.CreateIndex(
            name: "IX_CalendarEvents_CreatedByUserId",
            table: "CalendarEvents",
            column: "CreatedByUserId");

        // === NewsItems ===
        migrationBuilder.CreateTable(
            name: "NewsItems",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Body = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                PublishedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                InstituteId = table.Column<int>(type: "integer", nullable: true),
                GameSeasonId = table.Column<int>(type: "integer", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_NewsItems", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_NewsItems_PublishedAtUtc",
            table: "NewsItems",
            column: "PublishedAtUtc");

        // === ActivityFeedItems ===
        migrationBuilder.CreateTable(
            name: "ActivityFeedItems",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Type = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                TeamId = table.Column<int>(type: "integer", nullable: true),
                UserId = table.Column<int>(type: "integer", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ActivityFeedItems", x => x.Id);
                table.ForeignKey(
                    name: "FK_ActivityFeedItems_Teams_TeamId",
                    column: x => x.TeamId,
                    principalTable: "Teams",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
                table.ForeignKey(
                    name: "FK_ActivityFeedItems_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex(
            name: "IX_ActivityFeedItems_CreatedAtUtc",
            table: "ActivityFeedItems",
            column: "CreatedAtUtc");

        migrationBuilder.CreateIndex(
            name: "IX_ActivityFeedItems_TeamId",
            table: "ActivityFeedItems",
            column: "TeamId");

        migrationBuilder.CreateIndex(
            name: "IX_ActivityFeedItems_UserId",
            table: "ActivityFeedItems",
            column: "UserId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "ActivityFeedItems");
        migrationBuilder.DropTable(name: "NewsItems");
        migrationBuilder.DropTable(name: "CalendarEvents");
        migrationBuilder.DropTable(name: "UserAchievements");
        migrationBuilder.DropTable(name: "Achievements");
        migrationBuilder.DropTable(name: "TeamChallengeProgresses");
        migrationBuilder.DropTable(name: "Challenges");

        migrationBuilder.DropIndex(name: "IX_KnowledgePosts_Type", table: "KnowledgePosts");

        migrationBuilder.DropColumn(name: "Status", table: "CheckIns");
        migrationBuilder.DropColumn(name: "SubmittedAtUtc", table: "CheckIns");

        migrationBuilder.DropIndex(name: "IX_HelpRequests_Status", table: "HelpRequests");
        migrationBuilder.DropColumn(name: "Topic", table: "HelpRequests");
        migrationBuilder.DropColumn(name: "Tag", table: "HelpRequests");
        migrationBuilder.DropColumn(name: "Format", table: "HelpRequests");
        migrationBuilder.DropColumn(name: "LeagueLabel", table: "HelpRequests");
        migrationBuilder.DropColumn(name: "ScheduledAtUtc", table: "HelpRequests");
        migrationBuilder.DropColumn(name: "BonusAwarded", table: "HelpRequests");

        migrationBuilder.DropIndex(name: "IX_Teams_Score", table: "Teams");
        migrationBuilder.DropColumn(name: "KrkCached", table: "Teams");
        migrationBuilder.DropColumn(name: "KrkCachedAtUtc", table: "Teams");
        migrationBuilder.DropColumn(name: "InstituteId", table: "Teams");
        migrationBuilder.DropColumn(name: "GameSeasonId", table: "Teams");

        migrationBuilder.DropIndex(name: "IX_Users_UserPoints", table: "Users");
        migrationBuilder.DropColumn(name: "UserPoints", table: "Users");
        migrationBuilder.DropColumn(name: "InstituteId", table: "Users");
    }
}
