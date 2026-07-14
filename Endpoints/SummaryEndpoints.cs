using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Services;

namespace Endpoints
{
    public static class SummaryEndpoints
    {
        public static void MapSummaryEndpoints(this WebApplication app)
        {
            app.MapGet("/api/summary/daily", async (ISummaryService svc) =>
            {
                var summary = await svc.GetDailySummaryAsync();
                return summary == null
                    ? Results.Json(new { error = "The AI assistant isn't available right now." }, statusCode: 503)
                    : Results.Ok(summary);
            });

            app.MapPost("/api/summary/daily/refresh", async (ISummaryService svc) =>
            {
                var summary = await svc.RefreshDailySummaryAsync();
                return summary == null
                    ? Results.Json(new { error = "The AI assistant isn't available right now." }, statusCode: 503)
                    : Results.Ok(summary);
            });
        }
    }
}
