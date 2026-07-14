using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSS_Personal_Reader.Migrations
{
    /// <inheritdoc />
    public partial class ScopeFeedsAndSummariesPerUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Feeds/articles/read-state/favorites/summaries predate per-user ownership, so there is
            // no way to know which user each row belongs to. Clear them out rather than assigning
            // everything to an arbitrary account or an invalid placeholder UserId that would fail the
            // new NOT NULL foreign key below; users re-add their own feeds going forward.
            migrationBuilder.Sql("DELETE FROM ReadArticles;");
            migrationBuilder.Sql("DELETE FROM FavoriteArticles;");
            migrationBuilder.Sql("DELETE FROM Articles;");
            migrationBuilder.Sql("DELETE FROM Feeds;");
            migrationBuilder.Sql("DELETE FROM DailySummaries;");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DailySummaries",
                table: "DailySummaries");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "DailySummaries");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Feeds",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "DailySummaries",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_DailySummaries",
                table: "DailySummaries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Feeds_UserId",
                table: "Feeds",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_DailySummaries_Users_UserId",
                table: "DailySummaries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Feeds_Users_UserId",
                table: "Feeds",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailySummaries_Users_UserId",
                table: "DailySummaries");

            migrationBuilder.DropForeignKey(
                name: "FK_Feeds_Users_UserId",
                table: "Feeds");

            migrationBuilder.DropIndex(
                name: "IX_Feeds_UserId",
                table: "Feeds");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DailySummaries",
                table: "DailySummaries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Feeds");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "DailySummaries");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "DailySummaries",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0)
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_DailySummaries",
                table: "DailySummaries",
                column: "Id");
        }
    }
}
