using System;
using System.Text.RegularExpressions;

namespace Validation
{
    public static class FeedUrlValidator
    {
        // Basic URL validation using Uri.TryCreate plus optional regex for scheme
        public static bool IsValid(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return false;
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return false;
            if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) return false;
            return true;
        }
    }
}
