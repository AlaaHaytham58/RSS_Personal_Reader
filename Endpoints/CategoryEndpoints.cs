using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using Dtos;
using Services;

namespace Endpoints
{
    public static class CategoryEndpoints
    {
        public static void MapCategoryEndpoints(this WebApplication app)
        {
            app.MapGet("/api/categories", async (ICategoryService svc) =>
            {
                var categories = await svc.GetAllAsync();
                var list = categories.ConvertAll(c => new CategoryResponse { Id = c.Id, Name = c.Name, Color = c.Color });
                return Results.Ok(list);
            });

            app.MapPost("/api/categories", async (AddCategoryRequest req, ICategoryService svc) =>
            {
                if (req == null || string.IsNullOrWhiteSpace(req.Name))
                {
                    return Results.BadRequest(new { error = "Name is required" });
                }

                var category = await svc.CreateAsync(req.Name.Trim(), req.Color);
                return Results.Created($"/api/categories/{category.Id}", new CategoryResponse { Id = category.Id, Name = category.Name, Color = category.Color });
            });

            app.MapDelete("/api/categories/{id:guid}", async (Guid id, ICategoryService svc) =>
            {
                var ok = await svc.DeleteAsync(id);
                return ok ? Results.NoContent() : Results.NotFound();
            });

            app.MapPatch("/api/feeds/{id:guid}/category", async (Guid id, AssignFeedCategoryRequest req, ICategoryService svc) =>
            {
                var ok = await svc.AssignFeedCategoryAsync(id, req?.CategoryId);
                return ok ? Results.NoContent() : Results.NotFound();
            });
        }
    }
}
