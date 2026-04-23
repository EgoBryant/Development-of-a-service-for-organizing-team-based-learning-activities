using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamExamProject.Migrations
{
    public partial class AddUniqueCaptainIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Teams_CaptainUserId",
                table: "Teams");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_CaptainUserId",
                table: "Teams",
                column: "CaptainUserId",
                unique: true,
                filter: "\"CaptainUserId\" IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Teams_CaptainUserId",
                table: "Teams");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_CaptainUserId",
                table: "Teams",
                column: "CaptainUserId");
        }
    }
}
