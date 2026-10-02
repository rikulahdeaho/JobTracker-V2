using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class ApplicationContactPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationMethod",
                table: "JobApplications",
                type: "TEXT",
                nullable: false,
                defaultValue: "Unknown");

            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "JobApplications",
                type: "TEXT",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                table: "JobApplications",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FollowUpMode",
                table: "JobApplications",
                type: "TEXT",
                nullable: false,
                defaultValue: "Unknown");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicationMethod",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "ContactPerson",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "FollowUpMode",
                table: "JobApplications");
        }
    }
}
