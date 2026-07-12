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

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AppSettings _settings;
        private readonly ILogger<ChatService> _logger;

        public ChatService(IHttpClientFactory httpClientFactory, AppSettings settings, ILogger<ChatService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _settings = settings;
            _logger = logger;
        }

        public async Task<ChatOutcome> AskAsync(List<ChatMessage> messages)
        {
            var apiKey = _settings.DeepSeek.ApiKey;
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("Chat request rejected: no DeepSeek API key configured (set DEEPSEEK_API_KEY in .env or AppSettings__DeepSeek__ApiKey).");
                return new ChatNotConfigured();
            }

            var history = messages
                .Where(m => !string.IsNullOrWhiteSpace(m.Content))
                .TakeLast(MaxHistoryMessages)
                .Select(m => new DeepSeekMessage { Role = m.Role == "assistant" ? "assistant" : "user", Content = m.Content })
                .ToList();

            history.Insert(0, new DeepSeekMessage
            {
                Role = "system",
                Content = "You are a helpful assistant embedded in an RSS reader app. Answer questions about the user's articles and feeds, or general questions, concisely. Always reply in the same language the user wrote in, and match their writing direction (right-to-left for Arabic/Hebrew/Persian/Urdu, left-to-right otherwise).",
            });

            var payload = new DeepSeekRequest
            {
                Model = _settings.DeepSeek.Model,
                Messages = history,
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
