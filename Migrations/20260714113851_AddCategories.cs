using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RSS_Personal_Reader.Migrations
{
    /// <inheritdoc />
    public partial class AddCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Feeds",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Color = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Color", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "#2f5d62", "Sports" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "#8a5a3c", "Media" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "#6b4e71", "Politics" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "#556b8d", "Technology" },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "#5b6b2f", "General" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Feeds_CategoryId",
                table: "Feeds",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feeds_Categories_CategoryId",
                table: "Feeds",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feeds_Categories_CategoryId",
                table: "Feeds");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Feeds_CategoryId",
                table: "Feeds");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Feeds");
        }
    }
}
