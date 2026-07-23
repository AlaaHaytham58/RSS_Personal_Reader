using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Configuration;
using Hubs;

LoadDotEnv(FindDotEnvPath());

// Friendly alias: users set DEEPSEEK_API_KEY in .env; map it to the
// AppSettings:DeepSeek:ApiKey config key ASP.NET Core actually binds to.
if (Environment.GetEnvironmentVariable("AppSettings__DeepSeek__ApiKey") is null
    && Environment.GetEnvironmentVariable("DEEPSEEK_API_KEY") is { Length: > 0 } deepSeekKey)
{
    Environment.SetEnvironmentVariable("AppSettings__DeepSeek__ApiKey", deepSeekKey);
}

if (Environment.GetEnvironmentVariable("AppSettings__Google__ClientId") is null
    && Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") is { Length: > 0 } googleClientId)
{
    Environment.SetEnvironmentVariable("AppSettings__Google__ClientId", googleClientId);
}
if (Environment.GetEnvironmentVariable("AppSettings__Google__ClientSecret") is null
    && Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") is { Length: > 0 } googleClientSecret)
{
    Environment.SetEnvironmentVariable("AppSettings__Google__ClientSecret", googleClientSecret);
}

if (Environment.GetEnvironmentVariable("AppSettings__Tavily__ApiKey") is null
    && Environment.GetEnvironmentVariable("TAVILY_API_KEY") is { Length: > 0 } tavilyKey)
{
    Environment.SetEnvironmentVariable("AppSettings__Tavily__ApiKey", tavilyKey);
}

if (Environment.GetEnvironmentVariable("AppSettings__Smtp__Host") is null
    && Environment.GetEnvironmentVariable("SMTP_HOST") is { Length: > 0 } smtpHost)
{
    Environment.SetEnvironmentVariable("AppSettings__Smtp__Host", smtpHost);
}
if (Environment.GetEnvironmentVariable("AppSettings__Smtp__Port") is null
    && Environment.GetEnvironmentVariable("SMTP_PORT") is { Length: > 0 } smtpPort)
{
    Environment.SetEnvironmentVariable("AppSettings__Smtp__Port", smtpPort);
}
if (Environment.GetEnvironmentVariable("AppSettings__Smtp__Username") is null
    && Environment.GetEnvironmentVariable("SMTP_USER") is { Length: > 0 } smtpUser)
{
    Environment.SetEnvironmentVariable("AppSettings__Smtp__Username", smtpUser);
}
if (Environment.GetEnvironmentVariable("AppSettings__Smtp__Password") is null
    && Environment.GetEnvironmentVariable("SMTP_PASSWORD") is { Length: > 0 } smtpPassword)
{
    Environment.SetEnvironmentVariable("AppSettings__Smtp__Password", smtpPassword);
}
if (Environment.GetEnvironmentVariable("AppSettings__Smtp__FromAddress") is null
    && Environment.GetEnvironmentVariable("SMTP_FROM") is { Length: > 0 } smtpFrom)
{
    Environment.SetEnvironmentVariable("AppSettings__Smtp__FromAddress", smtpFrom);
}

var builder = WebApplication.CreateBuilder(args);

// Only override the URL when running on Railway (or any host that sets PORT)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Bind AppSettings
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<AppSettings>>().Value);

// Concurrency guard for file writes (singleton semaphore)
builder.Services.AddSingleton(new SemaphoreSlim(1, 1));

// HttpClient factory for outbound fetches
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("deepseek");
builder.Services.AddHttpClient("tavily");

// Repository (SQLite storage via EF Core)
builder.Services.AddDbContextFactory<Infrastructure.Storage.AppDbContext>((sp, options) =>
{
    var appSettings = sp.GetRequiredService<AppSettings>();
    options.UseSqlite(appSettings.SqliteConnectionString);
});
builder.Services.AddSingleton<Infrastructure.Storage.IFeedRepository, Infrastructure.Storage.EfFeedRepository>();
// Feed fetching/parsing
builder.Services.AddSingleton<Infrastructure.FeedFetching.IFeedFetcher, Infrastructure.FeedFetching.HttpFeedFetcher>();
builder.Services.AddSingleton<Infrastructure.FeedParsing.IFeedParser, Infrastructure.FeedParsing.SyndicationFeedParser>();
// Security: HTML sanitizer for article summaries
builder.Services.AddSingleton<Security.IHtmlSanitizer, Security.BasicHtmlSanitizer>();
// Validation and application services
builder.Services.AddScoped<Services.IFeedValidationService, Services.FeedValidationService>();
builder.Services.AddScoped<Services.IFeedService, Services.FeedService>();
builder.Services.AddScoped<Services.IArticleService, Services.ArticleService>();
builder.Services.AddScoped<Services.IChatService, Services.ChatService>();
builder.Services.AddScoped<Services.ICategoryService, Services.CategoryService>();
builder.Services.AddScoped<Services.ISummaryService, Services.SummaryService>();
builder.Services.AddScoped<Services.IEmailSender, Services.EmailSenderService>();
builder.Services.AddScoped<Services.IAuthService, Services.AuthService>();
builder.Services.AddScoped<Services.IUserService, Services.UserService>();
builder.Services.AddScoped<Services.IPostService, Services.PostService>();
builder.Services.AddScoped<Services.ISocialService, Services.SocialService>();
builder.Services.AddScoped<Services.INotificationService, Services.NotificationService>();
// Purges guest accounts (and their cascaded feeds/articles) 7 days after creation.
builder.Services.AddHostedService<Services.GuestCleanupService>();

// Reactions are posted as "Like"/"Love" strings (e.g. ReactToPostRequest.ReactionType),
// not their default numeric form, so minimal-API JSON binding needs the string converter.
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

// Cookie auth for the community posts feature (no login page; API returns status codes)
var googleClientIdConfig = builder.Configuration["AppSettings:Google:ClientId"];
var googleClientSecretConfig = builder.Configuration["AppSettings:Google:ClientSecret"];
var googleAuthConfigured = !string.IsNullOrEmpty(googleClientIdConfig) && !string.IsNullOrEmpty(googleClientSecretConfig);

var authBuilder = builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "rss_reader_auth";
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
        options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
        options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
    });

if (googleAuthConfigured)
{
    authBuilder.AddGoogle(options =>
    {
        options.ClientId = googleClientIdConfig!;
        options.ClientSecret = googleClientSecretConfig!;
        options.CallbackPath = "/api/auth/google/callback";
        // Land signed-in users straight in the cookie scheme; we replace the
        // Google claims with our own User record's claims before that sign-in happens.
        options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.Events.OnCreatingTicket = async ctx =>
        {
            var googleId = ctx.Principal?.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = ctx.Principal?.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = ctx.Principal?.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(googleId))
            {
                ctx.Fail("Google did not return an account identifier.");
                return;
            }

            // If the visitor arrived at Google as a guest, upgrade that same guest row so
            // their feeds/articles carry over instead of starting a disconnected account.
            Guid? claimGuestUserId = null;
            if (ctx.HttpContext.User.FindFirst("is_guest")?.Value == "true"
                && Guid.TryParse(ctx.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var guestId))
            {
                claimGuestUserId = guestId;
            }

            var authService = ctx.HttpContext.RequestServices.GetRequiredService<Services.IAuthService>();
            var outcome = await authService.ExternalLoginAsync(googleId, email, name, claimGuestUserId);
            if (outcome is not Services.AuthSuccess success)
            {
                ctx.Fail("Unable to sign in with Google.");
                return;
            }

            var identity = new System.Security.Claims.ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme);
            identity.AddClaim(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, success.User.Id.ToString()));
            identity.AddClaim(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, success.User.Username));
            identity.AddClaim(new System.Security.Claims.Claim("is_guest", "false"));
            ctx.Principal = new System.Security.Claims.ClaimsPrincipal(identity);
        };
    });
}

builder.Services.AddAuthorization();

// SignalR for real-time post/reply delivery
builder.Services.AddSignalR();

// OpenAPI (Swagger) for development
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();
    app.UseHttpsRedirection();
}
// Note: HTTPS redirection is skipped in production because Railway's proxy
// terminates TLS and forwards plain HTTP internally to the container.
// Trust Railway's X-Forwarded-Proto header so Request.Scheme reads "https"
// even though the request reaches this container over plain HTTP; otherwise
// the Google OAuth handler builds an http:// callback URL and Google rejects
// it as a redirect_uri_mismatch against the https:// URI registered in the
// Google Cloud Console.
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
};
forwardedHeadersOptions.KnownIPNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();

// Subscribed to automatically for every new guest so the reader shows real articles
// immediately instead of an empty state. Picked for reliability and topical variety.
var DefaultGuestFeedUrls = new[]
{
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://techcrunch.com/feed/",
    "https://www.nasa.gov/rss/dyn/breaking_news.rss",
};

// Anonymous visitors get a transparent guest session so they can use the app without
// signing up first; only AI features (summary/chat) check the is_guest claim and require
// a real account. Guests are purged after 7 days by GuestCleanupService.
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path.StartsWithSegments("/api") && ctx.User.Identity?.IsAuthenticated != true)
    {
        var authService = ctx.RequestServices.GetRequiredService<Services.IAuthService>();
        var guest = await authService.CreateGuestAsync();

        var identity = new System.Security.Claims.ClaimsIdentity(new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, guest.Id.ToString()),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, guest.Username),
            new System.Security.Claims.Claim("is_guest", "true"),
        }, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new System.Security.Claims.ClaimsPrincipal(identity);
        ctx.User = principal;

        await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30),
        });

        // Seed a few starter feeds so the guest sees real articles right away instead of
        // an empty reader. Awaited (not fire-and-forget) so they're already in place by
        // the time the frontend's very next call loads the feed list — the frontend
        // bootstraps the guest session with one awaited call before firing the rest of
        // its startup requests in parallel, so this only adds latency once per guest.
        var feedService = ctx.RequestServices.GetRequiredService<Services.IFeedService>();
        foreach (var feedUrl in DefaultGuestFeedUrls)
        {
            try
            {
                await feedService.AddFeedAsync(guest.Id, feedUrl);
            }
            catch
            {
                // Best-effort seeding; a slow/unreachable default feed shouldn't break guest sign-up.
            }
        }
    }

    await next();
});

app.UseAuthorization();

// Ensure the SQLite data directory exists and apply migrations.
// NOTE: legacy data/feeds.json is intentionally NOT auto-imported here anymore.
// It used to re-run on every startup where the Feeds table was empty (e.g. after
// the SQLite file was lost due to non-persistent container storage), silently
// overwriting real data with a stale, pre-Category snapshot. If the DB is ever
// genuinely empty, the app should just start empty rather than resurrect old data.
// Run JsonToSqliteImporter.ImportIfEmpty manually/one-off if you truly need to
// migrate a legacy feeds.json.
var settings = app.Services.GetRequiredService<AppSettings>();
var dataFilePath = settings.DataFilePath ?? "data/feeds.json";
var dataDir = Path.GetDirectoryName(dataFilePath);
if (!string.IsNullOrWhiteSpace(dataDir))
{
    Directory.CreateDirectory(dataDir);
}

using (var scope = app.Services.CreateScope())
{
    var dbContextFactory = scope.ServiceProvider.GetRequiredService<Microsoft.EntityFrameworkCore.IDbContextFactory<Infrastructure.Storage.AppDbContext>>();
    using var db = dbContextFactory.CreateDbContext();
    db.Database.Migrate();

    // One-time (idempotent) cleanup for feeds that were duplicated before URL
    // normalization existed (e.g. http vs https, www vs no-www, trailing slash).
    // Backfills NormalizedUrl for any row that doesn't have it yet, then merges
    // duplicates per user, keeping the oldest row; cascade delete removes the
    // duplicates' articles automatically.
    var allFeeds = db.Feeds.ToList();
    var needsBackfill = false;
    foreach (var feed in allFeeds)
    {
        var normalized = Services.UrlNormalizer.Normalize(feed.Url);
        if (feed.NormalizedUrl != normalized)
        {
            feed.NormalizedUrl = normalized;
            needsBackfill = true;
        }
    }
    if (needsBackfill) db.SaveChanges();

    var duplicateGroups = allFeeds
        .GroupBy(f => (f.UserId, f.NormalizedUrl))
        .Where(g => g.Count() > 1);
    var toRemove = duplicateGroups
        .SelectMany(g => g.OrderBy(f => f.AddedAt).Skip(1))
        .ToList();
    if (toRemove.Count > 0)
    {
        db.Feeds.RemoveRange(toRemove);
        db.SaveChanges();
    }
}

// Minimal health check
app.MapGet("/healthz", () => Results.Json(new { status = "ok" }));

// Map API endpoints
Endpoints.FeedEndpoints.MapFeedEndpoints(app);
Endpoints.ArticleEndpoints.MapArticleEndpoints(app);
Endpoints.ChatEndpoints.MapChatEndpoints(app);
Endpoints.CategoryEndpoints.MapCategoryEndpoints(app);
Endpoints.SummaryEndpoints.MapSummaryEndpoints(app);
Endpoints.AuthEndpoints.MapAuthEndpoints(app);
Endpoints.PostEndpoints.MapPostEndpoints(app);
Endpoints.UserEndpoints.MapUserEndpoints(app);
Endpoints.NotificationEndpoints.MapNotificationEndpoints(app);
app.MapHub<CommunityHub>("/hubs/community");

app.MapFallbackToFile("index.html");

app.Run();

// Locates a .env file near the running app. Depending on how the app is
// launched (dotnet run, IDE debugger, published exe), the current directory
// isn't always the project root, so walk up from the executable's own folder too.
static string? FindDotEnvPath()
{
    var candidates = new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory };

    foreach (var start in candidates)
    {
        var dir = new DirectoryInfo(start);
        for (var i = 0; dir != null && i < 6; i++)
        {
            var candidate = Path.Combine(dir.FullName, ".env");
            if (File.Exists(candidate))
            {
                return candidate;
            }
            dir = dir.Parent;
        }
    }

    return null;
}

// Minimal .env loader: reads KEY=VALUE lines into process environment
// variables so appsettings.json's env-var overrides pick them up. Existing
// environment variables always win, so real deployment env vars aren't overridden.
static void LoadDotEnv(string? path)
{
    if (path is null || !File.Exists(path))
    {
        return;
    }

    foreach (var rawLine in File.ReadAllLines(path))
    {
        var line = rawLine.Trim();
        if (line.Length == 0 || line.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');

        if (Environment.GetEnvironmentVariable(key) is null)
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}