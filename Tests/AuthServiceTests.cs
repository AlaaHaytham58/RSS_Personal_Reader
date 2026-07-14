using Infrastructure.Storage;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Services;
using Xunit;

namespace Tests
{
    public class AuthServiceTests
    {
        private static IDbContextFactory<AppDbContext> CreateInMemoryContextFactory()
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();
            var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
            using (var db = new AppDbContext(options))
            {
                db.Database.EnsureCreated();
            }

            return new TestDbContextFactory(options);
        }

        private sealed class TestDbContextFactory : IDbContextFactory<AppDbContext>
        {
            private readonly DbContextOptions<AppDbContext> _options;

            public TestDbContextFactory(DbContextOptions<AppDbContext> options)
            {
                _options = options;
            }

            public AppDbContext CreateDbContext() => new AppDbContext(_options);
        }

        [Fact]
        public async Task RegisterAsync_WithNewUsername_Succeeds()
        {
            var service = new AuthService(CreateInMemoryContextFactory());

            var outcome = await service.RegisterAsync("alice", "correct-horse");

            var success = Assert.IsType<AuthSuccess>(outcome);
            Assert.Equal("alice", success.User.Username);
        }

        [Fact]
        public async Task RegisterAsync_WithDuplicateUsername_ReturnsUsernameTaken()
        {
            var service = new AuthService(CreateInMemoryContextFactory());
            await service.RegisterAsync("alice", "correct-horse");

            var outcome = await service.RegisterAsync("alice", "another-password");

            Assert.IsType<AuthUsernameTaken>(outcome);
        }

        [Fact]
        public async Task ValidateCredentialsAsync_WithWrongPassword_ReturnsInvalidCredentials()
        {
            var service = new AuthService(CreateInMemoryContextFactory());
            await service.RegisterAsync("alice", "correct-horse");

            var outcome = await service.ValidateCredentialsAsync("alice", "wrong-password");

            Assert.IsType<AuthInvalidCredentials>(outcome);
        }

        [Fact]
        public async Task ValidateCredentialsAsync_WithCorrectPassword_Succeeds()
        {
            var service = new AuthService(CreateInMemoryContextFactory());
            await service.RegisterAsync("alice", "correct-horse");

            var outcome = await service.ValidateCredentialsAsync("alice", "correct-horse");

            var success = Assert.IsType<AuthSuccess>(outcome);
            Assert.Equal("alice", success.User.Username);
        }
    }
}
