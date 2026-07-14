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

            // 2. Check element extensions for media:content, media:thumbnail, itunes:image,
            // or content:encoded, searching recursively since some feeds nest media:content
            // inside a wrapping media:group.
            foreach (var ext in item.ElementExtensions)
            {
                try
                {
                    var element = ext.GetObject<System.Xml.Linq.XElement>();
                    var imgSrc = element != null ? FindImageInElement(element) : null;
                    if (imgSrc != null)
                        return imgSrc;
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
        /// Recursively searches an extension element (and its descendants, e.g. media:group
        /// wrapping media:content) for an image reference.
        /// </summary>
        private static string? FindImageInElement(System.Xml.Linq.XElement element)
        {
            var localName = element.Name.LocalName.ToLowerInvariant();
            var ns = element.Name.NamespaceName;

            // media:content or media:thumbnail with a url attribute. The real MRSS namespace
            // ("http://search.yahoo.com/mrss/") doesn't contain the word "media" at all, so
            // match on "mrss" too (and keep "media" for any less-standard namespace variants).
            if ((localName == "content" || localName == "thumbnail")
                && (ns.Contains("mrss", StringComparison.OrdinalIgnoreCase) || ns.Contains("media", StringComparison.OrdinalIgnoreCase)))
            {
                var urlAttr = element.Attribute("url");
                if (urlAttr != null && !string.IsNullOrWhiteSpace(urlAttr.Value))
                    return urlAttr.Value;
            }

            // itunes:image uses an href attribute rather than url/src
            if (localName == "image" && ns.Contains("itunes", StringComparison.OrdinalIgnoreCase))
            {
                var hrefAttr = element.Attribute("href");
                if (hrefAttr != null && !string.IsNullOrWhiteSpace(hrefAttr.Value))
                    return hrefAttr.Value;
            }

            // content:encoded - look for <img> tags inside the HTML content
            if (localName == "encoded" && string.Equals(ns, ContentNamespace, StringComparison.OrdinalIgnoreCase))
            {
                var imgSrc = ExtractFirstImageSrcFromHtml(element.Value);
                if (imgSrc != null)
                    return imgSrc;
            }

            // A generic "url"/"src" attribute on any element that looks image-like
            if (localName == "image" || localName == "img")
            {
                var urlAttr = element.Attribute("src") ?? element.Attribute("url") ?? element.Attribute("href");
                if (urlAttr != null && !string.IsNullOrWhiteSpace(urlAttr.Value))
                    return urlAttr.Value;
            }

            // Recurse into wrapper elements like media:group
            foreach (var child in element.Elements())
            {
                var found = FindImageInElement(child);
                if (found != null)
                    return found;
            }

            return null;
        }

        /// <summary>
        /// Simple regex-free extraction of an &lt;img&gt; src from HTML. Prefers a real "src"
        /// attribute but falls back to common lazy-load attributes ("data-src", "data-lazy-src",
        /// "data-original") when the src is missing or is an obvious 1x1 placeholder.
        /// </summary>
        private static string? ExtractFirstImageSrcFromHtml(string html)
        {
            var searchFrom = 0;
            while (true)
            {
                var imgTagStart = html.IndexOf("<img", searchFrom, StringComparison.OrdinalIgnoreCase);
                if (imgTagStart < 0)
                    return null;

                var tagEnd = html.IndexOf('>', imgTagStart);
                if (tagEnd < 0)
                    return null;

                var tag = html[imgTagStart..tagEnd];

                var src = ExtractAttribute(tag, "src");
                if (IsUsableImageUrl(src))
                    return src;

                foreach (var lazyAttr in new[] { "data-src", "data-lazy-src", "data-original" })
                {
                    var lazySrc = ExtractAttribute(tag, lazyAttr);
                    if (IsUsableImageUrl(lazySrc))
                        return lazySrc;
                }

                searchFrom = tagEnd + 1;
            }
        }

        private static bool IsUsableImageUrl(string? src)
        {
            if (string.IsNullOrWhiteSpace(src))
                return false;

            // Skip inline data URIs and obvious tracking/placeholder pixels.
            return !src.StartsWith("data:", StringComparison.OrdinalIgnoreCase)
                && !src.Contains("1x1", StringComparison.OrdinalIgnoreCase)
                && !src.Contains("pixel.gif", StringComparison.OrdinalIgnoreCase);
        }

        private static string? ExtractAttribute(string tag, string attributeName)
        {
            foreach (var quote in new[] { '"', '\'' })
            {
                var marker = $"{attributeName}={quote}";
                var start = tag.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                if (start < 0)
                    continue;

                start += marker.Length;
                var end = tag.IndexOf(quote, start);
                if (end > start)
                    return tag[start..end];
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
