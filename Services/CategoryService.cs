using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;

namespace Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IDbContextFactory<AppDbContext> _contextFactory;

        public CategoryService(IDbContextFactory<AppDbContext> contextFactory)
        {
            _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        }

        public async Task<List<Category>> GetAllAsync()
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            return await db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync();
        }

        public async Task<Category> CreateAsync(string name, string? color)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var category = new Category { Id = Guid.NewGuid(), Name = name, Color = color };
            db.Categories.Add(category);
            await db.SaveChangesAsync();
            return category;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (category == null)
            {
                return false;
            }

            db.Categories.Remove(category);
            await db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignFeedCategoryAsync(Guid feedId, Guid? categoryId)
        {
            await using var db = await _contextFactory.CreateDbContextAsync();
            var feed = await db.Feeds.FirstOrDefaultAsync(f => f.Id == feedId);
            if (feed == null)
            {
                return false;
            }

            if (categoryId.HasValue && !await db.Categories.AnyAsync(c => c.Id == categoryId.Value))
            {
                return false;
            }

            feed.CategoryId = categoryId;
            await db.SaveChangesAsync();
            return true;
        }
    }
}
