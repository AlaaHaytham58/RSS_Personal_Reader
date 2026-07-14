using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain;

namespace Services
{
    public interface ICategoryService
    {
        Task<List<Category>> GetAllAsync();
        Task<Category> CreateAsync(string name, string? color);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> AssignFeedCategoryAsync(Guid feedId, Guid? categoryId);
    }
}
