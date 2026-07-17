using System.Collections.Generic;
using System.Text.Json;
using Dtos;

namespace Services
{
    // Shared by AuthService and UserService so every UserResponse builder parses
    // User.SocialLinksJson the same way.
    internal static class SocialLinkSerializer
    {
        public static List<SocialLinkDto> Deserialize(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<SocialLinkDto>();

            try
            {
                return JsonSerializer.Deserialize<List<SocialLinkDto>>(json) ?? new List<SocialLinkDto>();
            }
            catch (JsonException)
            {
                return new List<SocialLinkDto>();
            }
        }

        public static string Serialize(List<SocialLinkDto> links) => JsonSerializer.Serialize(links);
    }
}
