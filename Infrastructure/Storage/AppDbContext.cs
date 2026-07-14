using Domain;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Storage
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Feed> Feeds => Set<Feed>();
        public DbSet<Article> Articles => Set<Article>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<ReadArticle> ReadArticles => Set<ReadArticle>();
        public DbSet<FavoriteArticle> FavoriteArticles => Set<FavoriteArticle>();
        public DbSet<DailySummary> DailySummaries => Set<DailySummary>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Post> Posts => Set<Post>();

        // Fixed ids so the default categories seed deterministically across environments.
        private static readonly Guid SportsCategoryId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private static readonly Guid MediaCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        private static readonly Guid PoliticsCategoryId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        private static readonly Guid TechnologyCategoryId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        private static readonly Guid GeneralCategoryId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        private static readonly Guid WorldCategoryId = Guid.Parse("66666666-6666-6666-6666-666666666666");
        private static readonly Guid BusinessCategoryId = Guid.Parse("77777777-7777-7777-7777-777777777777");
        private static readonly Guid EntertainmentCategoryId = Guid.Parse("88888888-8888-8888-8888-888888888888");
        private static readonly Guid ScienceCategoryId = Guid.Parse("99999999-9999-9999-9999-999999999999");
        private static readonly Guid HealthCategoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        private static readonly Guid EnvironmentCategoryId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Feed>(entity =>
            {
                entity.HasKey(f => f.Id);
                entity.Property(f => f.Url).IsRequired();
                entity.Property(f => f.Title).IsRequired();

                entity.HasMany(f => f.Articles)
                    .WithOne()
                    .HasForeignKey(a => a.FeedId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Category>()
                    .WithMany()
                    .HasForeignKey(f => f.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Article>(entity =>
            {
                // Article.Id is only unique within its owning feed (feed guid/link hash),
                // so the real primary key is the (FeedId, Id) pair.
                entity.HasKey(a => new { a.FeedId, a.Id });
                entity.Property(a => a.Id).IsRequired();
                entity.Property(a => a.Title).IsRequired();
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).IsRequired();

                entity.HasData(
                    new Category { Id = SportsCategoryId, Name = "Sports", Color = "#2f5d62" },
                    new Category { Id = MediaCategoryId, Name = "Media", Color = "#8a5a3c" },
                    new Category { Id = PoliticsCategoryId, Name = "Politics", Color = "#6b4e71" },
                    new Category { Id = TechnologyCategoryId, Name = "Technology", Color = "#556b8d" },
                    new Category { Id = GeneralCategoryId, Name = "General", Color = "#5b6b2f" },
                    new Category { Id = WorldCategoryId, Name = "World", Color = "#3f6b6b" },
                    new Category { Id = BusinessCategoryId, Name = "Business", Color = "#7a5c2e" },
                    new Category { Id = EntertainmentCategoryId, Name = "Entertainment", Color = "#8a3c5c" },
                    new Category { Id = ScienceCategoryId, Name = "Science", Color = "#3c5c8a" },
                    new Category { Id = HealthCategoryId, Name = "Health", Color = "#4a7a4a" },
                    new Category { Id = EnvironmentCategoryId, Name = "Environment", Color = "#5c7a3c" }
                );
            });

            modelBuilder.Entity<ReadArticle>(entity =>
            {
                entity.HasKey(r => new { r.FeedId, r.ArticleId });
            });

            modelBuilder.Entity<FavoriteArticle>(entity =>
            {
                entity.HasKey(f => new { f.FeedId, f.ArticleId });
            });

            modelBuilder.Entity<DailySummary>(entity =>
            {
                entity.HasKey(d => d.Id);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Username).IsRequired();
                entity.HasIndex(u => u.Username).IsUnique();
            });

            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Content).IsRequired();

                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(p => p.AuthorId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Post>()
                    .WithMany()
                    .HasForeignKey(p => p.ParentPostId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
