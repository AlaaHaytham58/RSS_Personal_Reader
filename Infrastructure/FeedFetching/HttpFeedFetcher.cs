using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.FeedFetching
{
    public class HttpFeedFetcher : IFeedFetcher
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AppSettings _settings;
        private readonly ILogger<HttpFeedFetcher> _logger;

        public HttpFeedFetcher(IHttpClientFactory httpClientFactory, AppSettings settings, ILogger<HttpFeedFetcher> logger)
        {
            _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<FetchResult> FetchAsync(string url, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(url)) return new FetchResult { IsSuccess = false, ErrorMessage = "Empty URL" };

            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            {
                return new FetchResult { IsSuccess = false, ErrorMessage = "Invalid URL" };
            }

            // SSRF guard: resolve host and reject private IP ranges
            try
            {
                IPAddress[] addresses;
                if (IPAddress.TryParse(uri.Host, out var ipLiteral))
                {
                    addresses = new[] { ipLiteral };
                }
                else
                {
                    addresses = await Dns.GetHostAddressesAsync(uri.Host, ct).ConfigureAwait(false);
                }

                foreach (var addr in addresses)
                {
                    if (IsPrivateIp(addr))
                    {
                        _logger.LogWarning("Blocked fetch to private IP {Ip} for URL {Url}", addr, url);
                        return new FetchResult { IsSuccess = false, ErrorMessage = "Endpoint resolves to a private or disallowed IP" };
                    }
                }
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                return new FetchResult { IsSuccess = false, ErrorMessage = "DNS resolution cancelled" };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DNS resolution failed for {Url}", url);
                return new FetchResult { IsSuccess = false, ErrorMessage = "DNS resolution failed" };
            }

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(Math.Max(1, _settings.FeedFetchTimeoutSeconds)));

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(Math.Max(1, _settings.FeedFetchTimeoutSeconds));
                using var req = new HttpRequestMessage(HttpMethod.Get, uri);
                // Several sites (feed URLs and, especially, plain homepages used for feed
                // autodiscovery) sit behind bot-detection that rejects requests with no
                // User-Agent header at all - HttpClient sends none by default.
                req.Headers.UserAgent.ParseAdd("Mozilla/5.0 (compatible; RSSPersonalReader/1.0; +https://github.com)");
                using var resp = await client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, cts.Token).ConfigureAwait(false);
                if (!resp.IsSuccessStatusCode)
                {
                    return new FetchResult { IsSuccess = false, ErrorMessage = $"HTTP {(int)resp.StatusCode} {resp.ReasonPhrase}" };
                }

                var contentLength = resp.Content.Headers.ContentLength;
                if (contentLength.HasValue && contentLength.Value > _settings.MaxFeedSizeBytes)
                {
                    return new FetchResult { IsSuccess = false, ErrorMessage = "Feed too large" };
                }

                using var stream = await resp.Content.ReadAsStreamAsync(cts.Token).ConfigureAwait(false);
                using var ms = new MemoryStream();
                var buffer = new byte[8192];
                long total = 0;
                int read;
                while ((read = await stream.ReadAsync(buffer, 0, buffer.Length, cts.Token).ConfigureAwait(false)) > 0)
                {
                    total += read;
                    if (total > _settings.MaxFeedSizeBytes)
                    {
                        return new FetchResult { IsSuccess = false, ErrorMessage = "Feed too large" };
                    }
                    ms.Write(buffer, 0, read);
                }

                ms.Position = 0;
                using var sr = new StreamReader(ms, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
                var text = await sr.ReadToEndAsync().ConfigureAwait(false);
                return new FetchResult { IsSuccess = true, RawContent = text };
            }
            catch (OperationCanceledException)
            {
                return new FetchResult { IsSuccess = false, ErrorMessage = "Fetch timed out" };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch {Url}", url);
                return new FetchResult { IsSuccess = false, ErrorMessage = "Fetch failed" };
            }
        }

        private static bool IsPrivateIp(IPAddress ip)
        {
            if (IPAddress.IsLoopback(ip)) return true;

            var bytes = ip.GetAddressBytes();
            if (ip.AddressFamily == AddressFamily.InterNetwork)
            {
                // 10.0.0.0/8
                if (bytes[0] == 10) return true;
                // 172.16.0.0/12
                if (bytes[0] == 172 && (bytes[1] >= 16 && bytes[1] <= 31)) return true;
                // 192.168.0.0/16
                if (bytes[0] == 192 && bytes[1] == 168) return true;
                // 169.254.0.0/16 link-local
                if (bytes[0] == 169 && bytes[1] == 254) return true;
                // 127.0.0.1/8
                if (bytes[0] == 127) return true;
            }

            if (ip.AddressFamily == AddressFamily.InterNetworkV6)
            {
                // IPv6 loopback ::1
                if (IPAddress.IPv6Loopback.Equals(ip)) return true;
                // Unique local addresses fc00::/7
                var first = bytes[0];
                if ((first & 0xFE) == 0xFC) return true;
                // Link-local fe80::/10
                if (first == 0xFE && (bytes[1] & 0xC0) == 0x80) return true;
            }

            return false;
        }
    }
}
