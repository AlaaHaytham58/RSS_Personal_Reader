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

        // Fixed ids so the default categories seed deterministically across environments.
        private static readonly Guid SportsCategoryId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private static readonly Guid MediaCategoryId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        private static readonly Guid PoliticsCategoryId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        private static readonly Guid TechnologyCategoryId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        private static readonly Guid GeneralCategoryId = Guid.Parse("55555555-5555-5555-5555-555555555555");

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
                    new Category { Id = GeneralCategoryId, Name = "General", Color = "#5b6b2f" }
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
        }
    }
}
