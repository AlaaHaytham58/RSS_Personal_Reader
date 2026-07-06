using System.Text.RegularExpressions;

namespace Security
{
    // Very small, conservative sanitizer for personal project use.
    // Removes script/style/tag attributes and returns plain text where possible.
    public class BasicHtmlSanitizer : IHtmlSanitizer
    {
        public string Sanitize(string html)
        {
            if (string.IsNullOrWhiteSpace(html)) return string.Empty;

            // remove script/style blocks
            html = Regex.Replace(html, @"<script[^>]*>.*?</script>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            html = Regex.Replace(html, @"<style[^>]*>.*?</style>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);

            // remove on* event handlers and javascript: urls in attributes
            html = Regex.Replace(html, @"\son[^""]*=""[^""]*""", string.Empty, RegexOptions.IgnoreCase);
            html = Regex.Replace(html, @"\son[^""]*='[^']*'", string.Empty, RegexOptions.IgnoreCase);
            html = Regex.Replace(html, @"javascript:\S*", string.Empty, RegexOptions.IgnoreCase);

            // remove all tags but keep inner text for common formatting tags
            // allow a whitelist of simple tags (a, p, br, strong, em)
            var allowed = new[] { "a", "p", "br", "strong", "em", "b", "i", "u" };
            html = Regex.Replace(html, @"<(/?)([^>\s]+)([^>]*)>", match =>
            {
                var tag = match.Groups[2].Value.ToLowerInvariant();
                if (System.Array.Exists(allowed, t => t == tag))
                {
                    // remove attributes for allowed tags
                    return "<" + match.Groups[1].Value + tag + ">";
                }
                return string.Empty;
            }, RegexOptions.IgnoreCase);

            return html.Trim();
        }
    }
}
