using Domain;
using Hubs;
using Infrastructure.Storage;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Services;
using Xunit;

namespace Tests
{
    public class PostServiceTests
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

        private sealed class NoOpHubContext : IHubContext<CommunityHub>
        {
            public IHubClients Clients { get; } = new NoOpHubClients();
            public IGroupManager Groups => throw new NotSupportedException();
        }

        private sealed class NoOpHubClients : IHubClients
        {
            private readonly IClientProxy _proxy = new NoOpClientProxy();
            public IClientProxy All => _proxy;
            public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds) => _proxy;
            public IClientProxy Client(string connectionId) => _proxy;
            public IClientProxy Clients(IReadOnlyList<string> connectionIds) => _proxy;
            public IClientProxy Group(string groupName) => _proxy;
            public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => _proxy;
            public IClientProxy Groups(IReadOnlyList<string> groupNames) => _proxy;
            public IClientProxy User(string userId) => _proxy;
            public IClientProxy Users(IReadOnlyList<string> userIds) => _proxy;
        }

        private sealed class NoOpClientProxy : IClientProxy
        {
            public Task SendCoreAsync(string method, object?[] args, CancellationToken cancellationToken = default) => Task.CompletedTask;
        }

        private static async Task<User> CreateUserAsync(IDbContextFactory<AppDbContext> factory, string username)
        {
            await using var db = await factory.CreateDbContextAsync();
            var user = new User { Id = Guid.NewGuid(), Username = username, PasswordHash = "x", CreatedAt = DateTimeOffset.UtcNow };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return user;
        }

        [Fact]
        public async Task CreatePostAsync_WithValidContent_CreatesRootPost()
        {
            var factory = CreateInMemoryContextFactory();
            var user = await CreateUserAsync(factory, "alice");
            var service = new PostService(factory, new NoOpHubContext());

            var outcome = await service.CreatePostAsync(user.Id, "Hello, world!", null);

            var success = Assert.IsType<PostSuccess>(outcome);
            Assert.Equal("Hello, world!", success.Post.Content);
            Assert.Null(success.Post.ParentPostId);
            Assert.Equal(0, success.Post.ReplyCount);
        }

        [Fact]
        public async Task CreatePostAsync_Reply_IncrementsParentReplyCount()
        {
            var factory = CreateInMemoryContextFactory();
            var user = await CreateUserAsync(factory, "alice");
            var service = new PostService(factory, new NoOpHubContext());
            var root = Assert.IsType<PostSuccess>(await service.CreatePostAsync(user.Id, "Root post", null));

            await service.CreatePostAsync(user.Id, "A reply", root.Post.Id);

            var timeline = await service.GetTimelineAsync(1, 20, null);
            Assert.Single(timeline);
            Assert.Equal(1, timeline[0].ReplyCount);
        }

        [Fact]
        public async Task CreatePostAsync_WithEmptyContent_ReturnsContentInvalid()
        {
            var factory = CreateInMemoryContextFactory();
            var user = await CreateUserAsync(factory, "alice");
            var service = new PostService(factory, new NoOpHubContext());

            var outcome = await service.CreatePostAsync(user.Id, "   ", null);

            Assert.IsType<PostContentInvalid>(outcome);
        }

        [Fact]
        public async Task CreatePostAsync_WithOversizedContent_ReturnsContentInvalid()
        {
            var factory = CreateInMemoryContextFactory();
            var user = await CreateUserAsync(factory, "alice");
            var service = new PostService(factory, new NoOpHubContext());

            var outcome = await service.CreatePostAsync(user.Id, new string('a', 281), null);

            Assert.IsType<PostContentInvalid>(outcome);
        }

        [Fact]
        public async Task CreatePostAsync_ReplyToNonexistentParent_ReturnsParentNotFound()
        {
            var factory = CreateInMemoryContextFactory();
            var user = await CreateUserAsync(factory, "alice");
            var service = new PostService(factory, new NoOpHubContext());

            var outcome = await service.CreatePostAsync(user.Id, "A reply", Guid.NewGuid());

            Assert.IsType<PostParentNotFound>(outcome);
        }

        [Fact]
        public async Task ToggleLikeAsync_OnUnlikedPost_LikesAndIncrementsCount()
        {
            var factory = CreateInMemoryContextFactory();
            var author = await CreateUserAsync(factory, "alice");
            var liker = await CreateUserAsync(factory, "bob");
            var service = new PostService(factory, new NoOpHubContext());
            var post = Assert.IsType<PostSuccess>(await service.CreatePostAsync(author.Id, "Hello", null));

            var outcome = await service.ToggleLikeAsync(liker.Id, post.Post.Id);

            var success = Assert.IsType<LikeSuccess>(outcome);
            Assert.True(success.Liked);
            Assert.Equal(1, success.LikeCount);
        }

        [Fact]
        public async Task ToggleLikeAsync_CalledTwice_UnlikesAndDecrementsCount()
        {
            var factory = CreateInMemoryContextFactory();
            var author = await CreateUserAsync(factory, "alice");
            var liker = await CreateUserAsync(factory, "bob");
            var service = new PostService(factory, new NoOpHubContext());
            var post = Assert.IsType<PostSuccess>(await service.CreatePostAsync(author.Id, "Hello", null));
            await service.ToggleLikeAsync(liker.Id, post.Post.Id);

            var outcome = await service.ToggleLikeAsync(liker.Id, post.Post.Id);

            var success = Assert.IsType<LikeSuccess>(outcome);
            Assert.False(success.Liked);
            Assert.Equal(0, success.LikeCount);
        }

        [Fact]
        public async Task GetTimelineAsync_LikedByCurrentUser_IsTrueOnlyForTheLiker()
        {
            var factory = CreateInMemoryContextFactory();
            var author = await CreateUserAsync(factory, "alice");
            var liker = await CreateUserAsync(factory, "bob");
            var bystander = await CreateUserAsync(factory, "carol");
            var service = new PostService(factory, new NoOpHubContext());
            var post = Assert.IsType<PostSuccess>(await service.CreatePostAsync(author.Id, "Hello", null));
            await service.ToggleLikeAsync(liker.Id, post.Post.Id);

            var likerView = await service.GetTimelineAsync(1, 20, liker.Id);
            var bystanderView = await service.GetTimelineAsync(1, 20, bystander.Id);

            Assert.True(likerView[0].LikedByCurrentUser);
            Assert.Equal(1, likerView[0].LikeCount);
            Assert.False(bystanderView[0].LikedByCurrentUser);
        }
    }
}
