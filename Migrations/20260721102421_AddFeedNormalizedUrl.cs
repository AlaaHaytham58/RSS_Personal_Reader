using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSS_Personal_Reader.Migrations
{
    /// <inheritdoc />
    public partial class AddFeedNormalizedUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NormalizedUrl",
                table: "Feeds",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NormalizedUrl",
                table: "Feeds");
        }
    }
}
