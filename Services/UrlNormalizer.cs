using System;

namespace Services
{
    // Normalizes feed URLs for duplicate comparison: scheme (http/https), "www.", default
    // ports, trailing slash and empty query strings shouldn't make two URLs look different.
    public static class UrlNormalizer
    {
        public static string Normalize(string url)
        {
            if (string.IsNullOrWhiteSpace(url)) return string.Empty;

            if (!Uri.TryCreate(url.Trim(), UriKind.Absolute, out var uri))
            {
                return url.Trim().TrimEnd('/').ToLowerInvariant();
            }

            var host = uri.Host.ToLowerInvariant();
            if (host.StartsWith("www.", StringComparison.Ordinal)) host = host[4..];

            var port = uri.IsDefaultPort ? string.Empty : $":{uri.Port}";
            var path = uri.AbsolutePath.TrimEnd('/');
            var query = uri.Query.Length > 1 ? uri.Query : string.Empty; // drop bare "?"

            return $"{host}{port}{path}{query}".ToLowerInvariant();
        }
    }
}
