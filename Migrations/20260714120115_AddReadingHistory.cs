using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSS_Personal_Reader.Migrations
{
    /// <inheritdoc />
    public partial class AddReadingHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FavoriteArticles",
                columns: table => new
                {
                    FeedId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ArticleId = table.Column<string>(type: "TEXT", nullable: false),
                    SavedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteArticles", x => new { x.FeedId, x.ArticleId });
                });

            migrationBuilder.CreateTable(
                name: "ReadArticles",
                columns: table => new
                {
                    FeedId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ArticleId = table.Column<string>(type: "TEXT", nullable: false),
                    ReadAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadArticles", x => new { x.FeedId, x.ArticleId });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FavoriteArticles");

            migrationBuilder.DropTable(
                name: "ReadArticles");
        }
    }
}
