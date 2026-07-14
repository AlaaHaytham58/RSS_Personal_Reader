using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Configuration;
using Dtos;
using Microsoft.Extensions.Logging;

namespace Services
{
    public class ChatService : IChatService
    {
        private const int MaxHistoryMessages = 16;
        private const int MaxContextArticles = 40;

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IArticleService _articleService;
        private readonly AppSettings _settings;
        private readonly ILogger<ChatService> _logger;

        public ChatService(IHttpClientFactory httpClientFactory, IArticleService articleService, AppSettings settings, ILogger<ChatService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _articleService = articleService;
            _settings = settings;
            _logger = logger;
        }

        public async Task<ChatOutcome> AskAsync(List<ChatMessage> messages)
        {
            var history = messages
                .Where(m => !string.IsNullOrWhiteSpace(m.Content))
                .TakeLast(MaxHistoryMessages)
                .Select(m => new DeepSeekMessage { Role = m.Role == "assistant" ? "assistant" : "user", Content = m.Content })
                .ToList();

            history.Insert(0, new DeepSeekMessage
            {
                Role = "system",
                Content = await BuildSystemPromptAsync(),
            });

            return await CallDeepSeekAsync(history);
        }

        public async Task<ChatOutcome> GenerateDailySummaryAsync()
        {
            List<Dtos.ArticleResponse> articles;
            try
            {
                articles = await _articleService.GetAllArticlesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load articles for daily summary");
                return new ChatUpstreamError();
            }

            if (articles.Count == 0)
            {
                return new ChatSuccess { Reply = "No articles yet. Add some feeds to get a daily summary." };
            }

            var grouped = articles
                .OrderByDescending(a => a.PublishedAt)
                .Take(MaxContextArticles)
                .GroupBy(a => string.IsNullOrWhiteSpace(a.FeedTitle) ? "General" : a.FeedTitle)
                .Select(g => $"## {g.Key}\n" + string.Join("\n", g.Select(a => $"- \"{a.Title}\": {Truncate(a.Summary, 160)}")));

            var prompt =
                "You write a concise \"Daily News Summary\" digest for a personal RSS reader. " +
                "Given the article list below (grouped by source), produce a short digest grouped by topic " +
                "(e.g. World, Technology, Business) using Markdown headings (##) and 2-4 bullet points per topic. " +
                "Be brief and factual; do not invent details not present in the list. " +
                "Reply only with the digest, no preamble.\n\n" + string.Join("\n\n", grouped);

            var messages = new List<DeepSeekMessage>
            {
                new() { Role = "system", Content = "You produce short, factual news digests from a provided article list only." },
                new() { Role = "user", Content = prompt },
            };

            return await CallDeepSeekAsync(messages);
        }

        private async Task<ChatOutcome> CallDeepSeekAsync(List<DeepSeekMessage> messages)
        {
            var apiKey = _settings.DeepSeek.ApiKey;
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("Chat request rejected: no DeepSeek API key configured (set DEEPSEEK_API_KEY in .env or AppSettings__DeepSeek__ApiKey).");
                return new ChatNotConfigured();
            }

            var payload = new DeepSeekRequest
            {
                Model = _settings.DeepSeek.Model,
                Messages = messages,
                Stream = false,
            };

            var client = _httpClientFactory.CreateClient("deepseek");
            client.Timeout = TimeSpan.FromSeconds(_settings.DeepSeek.TimeoutSeconds);
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            try
            {
                using var response = await client.PostAsJsonAsync(_settings.DeepSeek.ApiUrl, payload);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("DeepSeek request failed with {StatusCode}: {Body}", response.StatusCode, body);
                    return new ChatUpstreamError();
                }

                var result = await response.Content.ReadFromJsonAsync<DeepSeekResponse>();
                var reply = result?.Choices?.FirstOrDefault()?.Message?.Content?.Trim();
                if (string.IsNullOrWhiteSpace(reply))
                {
                    return new ChatUpstreamError();
                }

                return new ChatSuccess { Reply = reply };
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                _logger.LogWarning(ex, "DeepSeek request errored");
                return new ChatUpstreamError();
            }
        }

        private async Task<string> BuildSystemPromptAsync()
        {
            var basePrompt =
                "You are the reading assistant embedded in this user's RSS reader app. " +
                "Your sole job is to help the user work with the articles and feeds listed below: summarize them, " +
                "identify what's most urgent or time-sensitive, find articles about a topic, compare or group them, " +
                "and answer questions strictly about their content. " +
                "Do not answer general-knowledge questions or chat about unrelated topics; if asked something unrelated " +
                "to the user's feeds/articles, briefly redirect them to ask about their reading list instead. " +
                "Only reference articles from the list provided; never invent articles, links, or facts not present in it. " +
                "Always reply in the same language the user wrote in, and match their writing direction " +
                "(right-to-left for Arabic/Hebrew/Persian/Urdu, left-to-right otherwise).";

            List<Dtos.ArticleResponse> articles;
            try
            {
                articles = await _articleService.GetAllArticlesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load articles for chat context");
                return basePrompt + "\n\nThe user's article list could not be loaded right now.";
            }

            if (articles.Count == 0)
            {
                return basePrompt + "\n\nThe user has no articles in their feed yet.";
            }

            var context = string.Join("\n", articles
                .Take(MaxContextArticles)
                .Select(a => $"- [{a.FeedTitle}] \"{a.Title}\" (published {a.PublishedAt:yyyy-MM-dd HH:mm} UTC): {Truncate(a.Summary, 200)}"));

            return basePrompt + "\n\nHere are the user's most recent articles (newest first):\n" + context;
        }

        private static string Truncate(string text, int maxLength)
        {
            if (string.IsNullOrEmpty(text) || text.Length <= maxLength)
            {
                return text ?? string.Empty;
            }

            return text.Substring(0, maxLength).TrimEnd() + "...";
        }

        private class DeepSeekMessage
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = "user";

            [JsonPropertyName("content")]
            public string Content { get; set; } = "";
        }

        private class DeepSeekRequest
        {
            [JsonPropertyName("model")]
            public string Model { get; set; } = "deepseek-chat";

            [JsonPropertyName("messages")]
            public List<DeepSeekMessage> Messages { get; set; } = new();

            [JsonPropertyName("stream")]
            public bool Stream { get; set; }
        }

        private class DeepSeekResponse
        {
            [JsonPropertyName("choices")]
            public List<DeepSeekChoice>? Choices { get; set; }
        }

        private class DeepSeekChoice
        {
            [JsonPropertyName("message")]
            public DeepSeekMessage? Message { get; set; }
        }
    }
}
