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

        // Namespace for content:encoded elements (used by many RSS feeds for full article HTML)
        private static readonly string ContentNamespace = "http://purl.org/rss/1.0/modules/content/";

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

                    // Get the best available summary: prefer description, fall back to content:encoded text
                    var summaryText = item.Summary?.Text ?? string.Empty;
                    // If description is empty or very short, try content:encoded
                    if (string.IsNullOrWhiteSpace(summaryText) || summaryText.Length < 50)
                    {
                        var contentEncoded = ExtractContentEncodedText(item);
                        if (!string.IsNullOrWhiteSpace(contentEncoded))
                        {
                            summaryText = contentEncoded;
                        }
                    }
                    article.Summary = _sanitizer.Sanitize(summaryText);
                    article.PublishedAt = item.PublishDate == DateTimeOffset.MinValue ? DateTimeOffset.UtcNow : item.PublishDate;
                    article.FetchedAt = DateTimeOffset.UtcNow;

                    // Extract image URL from enclosure links, media:content, content:encoded, or summary HTML
                    article.ImageUrl = ExtractImageUrl(item);

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

        /// <summary>
        /// Extracts the text from a &lt;content:encoded&gt; element extension if present.
        /// </summary>
        private static string? ExtractContentEncodedText(SyndicationItem item)
        {
            foreach (var ext in item.ElementExtensions)
            {
                try
                {
                    var element = ext.GetObject<System.Xml.Linq.XElement>();
                    if (element != null)
                    {
                        // Check for content:encoded (namespace http://purl.org/rss/1.0/modules/content/)
                        if (string.Equals(element.Name.LocalName, "encoded", StringComparison.OrdinalIgnoreCase)
                            && string.Equals(element.Name.NamespaceName, ContentNamespace, StringComparison.OrdinalIgnoreCase))
                        {
                            return element.Value;
                        }
                    }
                }
                catch
                {
                    // Skip extensions we can't deserialize
                }
            }
            return null;
        }

        /// <summary>
        /// Attempts to extract an image URL from a feed item.
        /// Checks: enclosure links (for image MIME types), media:content element extensions,
        /// content:encoded element, and the first &lt;img&gt; tag found in the summary HTML.
        /// </summary>
        private string? ExtractImageUrl(SyndicationItem item)
        {
            // 1. Check SyndicationItem.Links for an enclosure with an image MIME type
            var enclosure = item.Links?.FirstOrDefault(l =>
                string.Equals(l.RelationshipType, "enclosure", StringComparison.OrdinalIgnoreCase)
                && l.MediaType != null
                && l.MediaType.StartsWith("image/", StringComparison.OrdinalIgnoreCase));
            if (enclosure?.Uri != null)
                return enclosure.Uri.ToString();

            // 2. Check element extensions for media:content, content:encoded, or other image references
            foreach (var ext in item.ElementExtensions)
            {
                try
                {
                    var element = ext.GetObject<System.Xml.Linq.XElement>();
                    if (element != null)
                    {
                        var localName = element.Name.LocalName.ToLowerInvariant();
                        var ns = element.Name.NamespaceName;

                        // media:content or media:thumbnail with a url attribute
                        if ((localName == "content" || localName == "thumbnail")
                            && ns.Contains("media", StringComparison.OrdinalIgnoreCase))
                        {
                            var urlAttr = element.Attribute("url");
                            if (urlAttr != null && !string.IsNullOrWhiteSpace(urlAttr.Value))
                                return urlAttr.Value;
                        }

                        // content:encoded - look for <img> tags inside the HTML content
                        if (localName == "encoded"
                            && string.Equals(ns, ContentNamespace, StringComparison.OrdinalIgnoreCase))
                        {
                            var imgSrc = ExtractFirstImageSrcFromHtml(element.Value);
                            if (imgSrc != null)
                                return imgSrc;
                        }

                        // Also check for a simple "url" attribute on any element that looks image-like
                        if (localName == "image" || localName == "img")
                        {
                            var urlAttr = element.Attribute("src") ?? element.Attribute("url");
                            if (urlAttr != null && !string.IsNullOrWhiteSpace(urlAttr.Value))
                                return urlAttr.Value;
                        }
                    }
                }
                catch
                {
                    // Skip extensions we can't deserialize
                }
            }

            // 3. Fallback: look for <img> tag in summary HTML content
            if (!string.IsNullOrWhiteSpace(item.Summary?.Text))
            {
                var summary = item.Summary.Text;
                var imgSrc = ExtractFirstImageSrcFromHtml(summary);
                if (imgSrc != null)
                    return imgSrc;
            }

            return null;
        }

        /// <summary>
        /// Simple regex-free extraction of the first src attribute from an &lt;img&gt; tag in HTML.
        /// </summary>
                private static string? ExtractFirstImageSrcFromHtml(string html)
        {
            var imgTagStart = html.IndexOf("<img ", StringComparison.OrdinalIgnoreCase);
            if (imgTagStart < 0)
            {
                imgTagStart = html.IndexOf("<img\n", StringComparison.OrdinalIgnoreCase);
                if (imgTagStart < 0)
                    imgTagStart = html.IndexOf("<img\t", StringComparison.OrdinalIgnoreCase);
                if (imgTagStart < 0)
                    return null;
            }

                        // Try double-quoted src first
            var srcStart = html.IndexOf("src=\"", imgTagStart, StringComparison.OrdinalIgnoreCase);
            if (srcStart >= 0)
            {
                srcStart += 5; // length of 'src="'
                var srcEnd = html.IndexOf('"', srcStart);
                if (srcEnd > srcStart)
                {
                    var src = html[srcStart..srcEnd];
                    if (!string.IsNullOrWhiteSpace(src))
                        return src;
                }
            }

            // Try single-quoted src
            srcStart = html.IndexOf("src='", imgTagStart, StringComparison.OrdinalIgnoreCase);
            if (srcStart >= 0)
            {
                srcStart += 5; // length of "src='"
                var srcEnd = html.IndexOf('\'', srcStart);
                if (srcEnd > srcStart)
                {
                    var src = html[srcStart..srcEnd];
                    if (!string.IsNullOrWhiteSpace(src))
                        return src;
                }
            }

                        return null;
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
