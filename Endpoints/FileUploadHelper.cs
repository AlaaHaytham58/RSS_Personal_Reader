using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Endpoints
{
    // Generic (non-image) file attachments for posts. Unlike ImageUploadHelper this can't
    // magic-byte-sniff every allowed type, so it leans on an extension allowlist instead —
    // deliberately excludes anything executable/script-like (.exe, .js, .html, .svg, ...).
    public static class FileUploadHelper
    {
        public const long MaxFileBytes = 20 * 1024 * 1024;

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
            ".txt", ".csv", ".zip", ".rar", ".7z",
            ".mp3", ".mp4", ".mov", ".wav",
            ".png", ".jpg", ".jpeg", ".gif", ".webp",
        };

        public static async Task<(string? RelativeUrl, string? FileName, string? Error)> SaveUploadedFileAsync(HttpContext ctx, IWebHostEnvironment env, string subfolder)
        {
            if (!ctx.Request.HasFormContentType)
            {
                return (null, null, "Expected multipart/form-data with a file.");
            }

            var form = await ctx.Request.ReadFormAsync();
            var file = form.Files["file"];
            if (file == null || file.Length == 0)
            {
                return (null, null, "No file was provided.");
            }

            if (file.Length > MaxFileBytes)
            {
                return (null, null, "File must be 20 MB or smaller.");
            }

            var originalName = Path.GetFileName(file.FileName);
            var extension = Path.GetExtension(originalName);
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                return (null, null, "This file type isn't supported.");
            }

            var uploadsDir = Path.Combine(env.WebRootPath, "uploads", subfolder);
            Directory.CreateDirectory(uploadsDir);

            // Stored under a random name (never the client-supplied one) so path traversal and
            // filename collisions aren't possible; the original name is kept only for display.
            var storedName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(uploadsDir, storedName);

            await using (var stream = File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            return ($"/uploads/{subfolder}/{storedName}", originalName, null);
        }
    }
}
