# RSS Personal Reader

A lightweight, self-hosted RSS/Atom feed reader built with ASP.NET Core on .NET 10.

Subscribe to feeds, get a unified feed of articles sorted by date, search across everything, and keep track of what you've read — all backed by simple, file-based local storage (no database).


<img width="1882" height="907" alt="Screenshot 2026-07-07 131438" src="https://github.com/user-attachments/assets/37f0a3a3-e7ac-45dd-a13f-dbddcea78f81" />


---

## Features

- Add any RSS or Atom feed by URL
- Unified article feed sorted by publish date
- Search across article titles, feed titles, and summaries
- Filter articles by subscription
- Refresh a single feed or all feeds at once
- Read/unread tracking (stored in your browser)
- HTML sanitization of feed content before rendering
- SSRF-safe feed fetching (blocks localhost and private IP ranges)
- Automated tests for core logic

---

## Architecture

The project follows a layered architecture:

| Layer | Responsibility | Key Files |
|---|---|---|
| Presentation | Browser UI | `wwwroot/index.html`, `wwwroot/js/app.js`, `wwwroot/css/site.css` |
| API | HTTP endpoints | `Program.cs`, `Endpoints/FeedEndpoints.cs`, `Endpoints/ArticleEndpoints.cs` |
| Services | Business logic | `Services/FeedService.cs`, `Services/ArticleService.cs`, `Services/FeedValidationService.cs` |
| Infrastructure | External I/O | `HttpFeedFetcher.cs`, `SyndicationFeedParser.cs`, `AppDbContext.cs`/`EfFeedRepository.cs` (SQLite via EF Core) |
| Domain | Core models | `Domain/Feed.cs`, `Domain/Article.cs` |
| Validation/Security | Input & content safety | `FeedUrlValidator.cs`, `BasicHtmlSanitizer.cs` |

---

## Getting Started

### Prerequisites

- .NET 10 SDK: https://dotnet.microsoft.com/download

### Installation & Run

```bash
git clone https://github.com/AlaaHaytham58/rss-personal-reader.git
cd rss-personal-reader

dotnet restore
dotnet run
```

The app will be available at:

```
https://localhost:5001
```

On first run, the app applies EF Core migrations and creates a `data/reader.db` SQLite database to store your subscriptions. If a legacy `data/feeds.json` is present and the database is still empty, it's imported automatically once.

### Running Tests

```bash
dotnet test
```

---

## Configuration

App settings live in `appsettings.json` and bind to `AppSettings`:

| Setting | Description |
|---|---|
| `DataFilePath` | Path to the legacy JSON file, imported once into SQLite if the database is empty |
| `SqliteConnectionString` | EF Core connection string for the SQLite database |
| `FeedFetchTimeoutSeconds` | Timeout when downloading a feed |
| `MaxArticlesPerFeed` | Cap on stored articles per feed |
| `MaxFeedSizeBytes` | Maximum allowed size of a feed response |

Example:

```json
{
  "AppSettings": {
    "DataFilePath": "data/feeds.json",
    "FeedFetchTimeoutSeconds": 15,
    "MaxArticlesPerFeed": 100,
    "MaxFeedSizeBytes": 5000000
  }
}
```

---

## API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/feeds` | List all subscribed feeds |
| POST | `/api/feeds` | Add a new feed |
| DELETE | `/api/feeds/{id}` | Remove a feed |
| POST | `/api/feeds/{id}/refresh` | Refresh a single feed |
| GET | `/api/articles` | List all articles across feeds |

Swagger UI is available in development mode for interactive API exploration.

---

## Security

- SSRF protection — blocks requests to localhost and private/link-local IP ranges when fetching feeds
- Safe XML parsing — DTD processing disabled, external entity resolution disabled
- HTML sanitization — strips `<script>`/`<style>` tags, event handler attributes, and `javascript:` URLs from feed content before rendering

This sanitizer is intentionally simple and conservative — suitable for a personal project, but not a substitute for a security-reviewed sanitization library in a high-risk, public-facing deployment.

---

## Tech Stack

- Backend: ASP.NET Core (.NET 10), minimal APIs
- Feed Parsing: `System.ServiceModel.Syndication`
- Storage: SQLite via EF Core (migrations applied automatically on startup)
- Frontend: Vanilla HTML/CSS/JavaScript
- Testing: xUnit

---

## Project Structure

```
├── Program.cs
├── Configuration/
│   └── AppSettings.cs
├── Domain/
│   ├── Feed.cs
│   └── Article.cs
├── Dtos/
│   ├── AddFeedRequest.cs
│   ├── FeedResponse.cs
│   └── ArticleResponse.cs
├── Endpoints/
│   ├── FeedEndpoints.cs
│   └── ArticleEndpoints.cs
├── Services/
│   ├── FeedService.cs
│   ├── ArticleService.cs
│   ├── FeedValidationService.cs
│   └── Outcomes.cs
├── Infrastructure/
│   ├── FeedFetching/HttpFeedFetcher.cs
│   ├── FeedParsing/SyndicationFeedParser.cs
│   └── Storage/AppDbContext.cs, EfFeedRepository.cs
├── Validation/
│   └── FeedUrlValidator.cs
├── Security/
│   └── BasicHtmlSanitizer.cs
├── wwwroot/
│   ├── index.html
│   ├── js/app.js
│   └── css/site.css
├── Tests/
│   ├── ArticleServiceTests.cs
│   └── BasicHtmlSanitizerTests.cs
└── data/
    └── feeds.json
```

---
