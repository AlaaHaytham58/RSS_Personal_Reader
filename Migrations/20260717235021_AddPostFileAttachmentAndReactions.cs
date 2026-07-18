using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSS_Personal_Reader.Migrations
{
    /// <inheritdoc />
    public partial class AddPostFileAttachmentAndReactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "Posts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "Posts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReactionType",
                table: "Likes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "ReactionType",
                table: "Likes");
        }
    }
}
