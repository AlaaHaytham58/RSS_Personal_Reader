using System;

namespace Dtos
{
    public class CategoryResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
    }

    public class AddCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
    }

    public class AssignFeedCategoryRequest
    {
        public Guid? CategoryId { get; set; }
    }
}
