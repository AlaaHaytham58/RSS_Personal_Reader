using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Xml;
using System.ServiceModel.Syndication;
using Domain;
using Microsoft.Extensions.Logging;

namespace Infrastructure.FeedParsing
{
    public class SyndicationFeedParser : IFeedParser
    {
        private readonly ILogger<SyndicationFeedParser> _logger;
        private readonly Security.IHtmlSanitizer _sanitizer;

        public SyndicationFeedParser(ILogger<SyndicationFeedParser> logger, Security.IHtmlSanitizer sanitizer)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _sanitizer = sanitizer ?? throw new ArgumentNullException(nameof(sanitizer));
        }

        public ParseResult Parse(string rawContent)
        {
            if (string.IsNullOrWhiteSpace(rawContent)) return new ParseResult { IsSuccess = false, ErrorMessage = "Empty content" };

            try
            {
                var settings = new XmlReaderSettings
                {
                    DtdProcessing = DtdProcessing.Prohibit,
                    XmlResolver = null,
                    IgnoreComments = true,
                    IgnoreProcessingInstructions = true
                };

                using var sr = new System.IO.StringReader(rawContent);
                using var xr = XmlReader.Create(sr, settings);
                var feed = SyndicationFeed.Load(xr);
                if (feed == null) return new ParseResult { IsSuccess = false, ErrorMessage = "Not a valid feed" };

                var result = new ParseResult
                {
                    IsSuccess = true,
                    FeedTitle = feed.Title?.Text,
                    SiteUrl = feed.Links?.FirstOrDefault(l => string.Equals(l.RelationshipType, "alternate", StringComparison.OrdinalIgnoreCase))?.Uri?.ToString()
                };

                foreach (var item in feed.Items)
                {
                    var article = new Article();
                    // Id: prefer item.Id, else link, else hash
                    if (!string.IsNullOrWhiteSpace(item.Id)) article.Id = item.Id;
                    else if (item.Links.FirstOrDefault()?.Uri != null) article.Id = item.Links.First().Uri.ToString();
                    else article.Id = ComputeHash((item.Title?.Text ?? string.Empty) + item.PublishDate.ToString());

                    article.FeedId = Guid.Empty; // assigned by caller
                    article.Title = item.Title?.Text ?? string.Empty;
                    article.Link = item.Links.FirstOrDefault()?.Uri?.ToString() ?? string.Empty;
                    // sanitize summary to remove potentially dangerous HTML before storage
                    article.Summary = _sanitizer.Sanitize(item.Summary?.Text ?? string.Empty);
                    article.PublishedAt = item.PublishDate == DateTimeOffset.MinValue ? DateTimeOffset.UtcNow : item.PublishDate;
                    article.FetchedAt = DateTimeOffset.UtcNow;

                    result.Articles.Add(article);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse feed");
                return new ParseResult { IsSuccess = false, ErrorMessage = "Parse error" };
            }
        }

        private static string ComputeHash(string input)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToHexString(hash);
        }
    }
}
