using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamExamProject.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileAndCaptainPolicies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Teams" DROP CONSTRAINT IF EXISTS "FK_Teams_Users_CaptainUserId";
                DROP INDEX IF EXISTS "IX_Teams_CaptainUserId";
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CreatedAtUtc'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CreatedAt'
                    ) THEN
                        ALTER TABLE "Teams" RENAME COLUMN "CreatedAtUtc" TO "CreatedAt";
                    END IF;
                END $$;
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CaptainUserId'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CaptainId'
                    ) THEN
                        ALTER TABLE "Teams" RENAME COLUMN "CaptainUserId" TO "CaptainId";
                    END IF;
                END $$;
                """);

            migrationBuilder.Sql("""
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AvatarUrl" character varying(500) NOT NULL DEFAULT '';
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "Bio" character varying(1000) NOT NULL DEFAULT '';
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "ContactEmail" character varying(200) NOT NULL DEFAULT '';
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "PhoneNumber" character varying(32) NOT NULL DEFAULT '';
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "TelegramHandle" character varying(100) NOT NULL DEFAULT '';
                """);

            migrationBuilder.Sql("""
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_Teams_CaptainId" ON "Teams" ("CaptainId");
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Teams_Users_CaptainId'
                    ) THEN
                        ALTER TABLE "Teams"
                        ADD CONSTRAINT "FK_Teams_Users_CaptainId"
                        FOREIGN KEY ("CaptainId") REFERENCES "Users" ("Id")
                        ON DELETE RESTRICT;
                    END IF;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "Teams" DROP CONSTRAINT IF EXISTS "FK_Teams_Users_CaptainId";
                DROP INDEX IF EXISTS "IX_Teams_CaptainId";
                """);

            migrationBuilder.Sql("""
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "AvatarUrl";
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "Bio";
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "ContactEmail";
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "PhoneNumber";
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "TelegramHandle";
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CreatedAt'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CreatedAtUtc'
                    ) THEN
                        ALTER TABLE "Teams" RENAME COLUMN "CreatedAt" TO "CreatedAtUtc";
                    END IF;
                END $$;
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CaptainId'
                    ) AND NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'Teams' AND column_name = 'CaptainUserId'
                    ) THEN
                        ALTER TABLE "Teams" RENAME COLUMN "CaptainId" TO "CaptainUserId";
                    END IF;
                END $$;
                """);

            migrationBuilder.Sql("""
                CREATE INDEX IF NOT EXISTS "IX_Teams_CaptainUserId" ON "Teams" ("CaptainUserId");
                """);

            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_Teams_Users_CaptainUserId'
                    ) THEN
                        ALTER TABLE "Teams"
                        ADD CONSTRAINT "FK_Teams_Users_CaptainUserId"
                        FOREIGN KEY ("CaptainUserId") REFERENCES "Users" ("Id")
                        ON DELETE RESTRICT;
                    END IF;
                END $$;
                """);
        }
    }
}
