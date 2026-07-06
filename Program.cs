using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using Microsoft.Extensions.Options;
using Configuration;

var builder = WebApplication.CreateBuilder(args);

// Bind AppSettings
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<AppSettings>>().Value);

// Concurrency guard for file writes (singleton semaphore)
builder.Services.AddSingleton(new SemaphoreSlim(1, 1));

// HttpClient factory for outbound fetches
builder.Services.AddHttpClient();

// Repository (json file storage)
builder.Services.AddSingleton<Infrastructure.Storage.IFeedRepository, Infrastructure.Storage.JsonFeedRepository>();
// Feed fetching/parsing
builder.Services.AddSingleton<Infrastructure.FeedFetching.IFeedFetcher, Infrastructure.FeedFetching.HttpFeedFetcher>();
builder.Services.AddSingleton<Infrastructure.FeedParsing.IFeedParser, Infrastructure.FeedParsing.SyndicationFeedParser>();
// Security: HTML sanitizer for article summaries
builder.Services.AddSingleton<Security.IHtmlSanitizer, Security.BasicHtmlSanitizer>();
// Validation and application services
builder.Services.AddScoped<Services.IFeedValidationService, Services.FeedValidationService>();
builder.Services.AddScoped<Services.IFeedService, Services.FeedService>();
builder.Services.AddScoped<Services.IArticleService, Services.ArticleService>();

// OpenAPI (Swagger) for development
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

// Ensure data directory and initial feeds.json exist
var settings = app.Services.GetRequiredService<AppSettings>();
var dataFilePath = settings.DataFilePath ?? "data/feeds.json";
var dataDir = Path.GetDirectoryName(dataFilePath);
if (!string.IsNullOrWhiteSpace(dataDir))
{
    Directory.CreateDirectory(dataDir);
}

if (!File.Exists(dataFilePath))
{
    var initial = JsonSerializer.Serialize(new { schemaVersion = 1, feeds = Array.Empty<object>() }, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText(dataFilePath, initial);
}

// Minimal health check
app.MapGet("/healthz", () => Results.Json(new { status = "ok" }));

// Map API endpoints
Endpoints.FeedEndpoints.MapFeedEndpoints(app);
Endpoints.ArticleEndpoints.MapArticleEndpoints(app);

app.MapFallbackToFile("index.html");

app.Run();
