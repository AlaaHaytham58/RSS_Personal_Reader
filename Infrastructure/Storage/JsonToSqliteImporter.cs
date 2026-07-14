using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Storage
{
    /// <summary>
    /// One-time migration path from the legacy data/feeds.json file into SQLite.
    /// Only runs when the database has no feeds yet; the JSON file is left untouched
    /// afterwards as a safety net.
    /// </summary>
    public static class JsonToSqliteImporter
    {
        public static void ImportIfEmpty(AppDbContext db, string jsonFilePath, ILogger logger)
        {
            if (db.Feeds.Any())
            {
                return;
            }

            if (!File.Exists(jsonFilePath))
            {
                return;
            }

            try
            {
                var text = File.ReadAllText(jsonFilePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var wrapper = JsonSerializer.Deserialize<FeedsFileWrapper>(text, options);

                if (wrapper?.Feeds is not { Count: > 0 } feeds)
                {
                    return;
                }

                foreach (var feed in feeds)
                {
                    foreach (var article in feed.Articles)
                    {
                        article.FeedId = feed.Id;
                    }
                }

                db.Feeds.AddRange(feeds);
                db.SaveChanges();
                logger.LogInformation("Imported {Count} feed(s) from {Path} into SQLite", feeds.Count, jsonFilePath);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to import {Path} into SQLite", jsonFilePath);
            }
        }

        private class FeedsFileWrapper
        {
            public int SchemaVersion { get; set; }
            public List<Feed> Feeds { get; set; } = new();
        }
    }
}
