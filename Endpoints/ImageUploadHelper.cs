using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Endpoints
{
    // Shared by UserEndpoints (avatar/cover) and PostEndpoints (post images) so the
    // magic-byte validation lives in one place instead of being copy-pasted per feature.
    public static class ImageUploadHelper
    {
        public const long MaxImageBytes = 5 * 1024 * 1024;

        public static async Task<(string? RelativeUrl, string? Error)> SaveUploadedImageAsync(HttpContext ctx, IWebHostEnvironment env, string subfolder)
        {
            if (!ctx.Request.HasFormContentType)
            {
                return (null, "Expected multipart/form-data with an image file.");
            }

            var form = await ctx.Request.ReadFormAsync();
            var file = form.Files["file"];
            if (file == null || file.Length == 0)
            {
                return (null, "No image file was provided.");
            }

            if (file.Length > MaxImageBytes)
            {
                return (null, "Image must be 5 MB or smaller.");
            }

            var extension = await DetectImageExtensionAsync(file);
            if (extension == null)
            {
                return (null, "Only PNG, JPEG, GIF, or WEBP images are supported.");
            }

            var uploadsDir = Path.Combine(env.WebRootPath, "uploads", subfolder);
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(uploadsDir, fileName);

            await using (var stream = File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            return ($"/uploads/{subfolder}/{fileName}", null);
        }

        // Sniffs the first bytes of the upload rather than trusting the client-supplied
        // content-type/filename, so a renamed non-image file can't slip through.
        private static async Task<string?> DetectImageExtensionAsync(IFormFile file)
        {
            var header = new byte[12];
            await using (var stream = file.OpenReadStream())
            {
                var read = await stream.ReadAsync(header.AsMemory(0, header.Length));
                if (read < 4) return null;
            }

            if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) return ".png";
            if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return ".jpg";
            if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38) return ".gif";
            if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) return ".webp";

            return null;
        }

        // Only deletes files this helper itself wrote (under wwwroot/uploads/{subfolder}),
        // so a crafted URL value can never be used to delete arbitrary files on disk.
        public static void DeleteUpload(IWebHostEnvironment env, string? previousUrl, string subfolder)
        {
            if (string.IsNullOrEmpty(previousUrl)) return;

            var prefix = $"/uploads/{subfolder}/";
            if (!previousUrl.StartsWith(prefix, StringComparison.Ordinal)) return;

            var fileName = Path.GetFileName(previousUrl);
            if (string.IsNullOrEmpty(fileName)) return;

            var fullPath = Path.Combine(env.WebRootPath, "uploads", subfolder, fileName);
            if (File.Exists(fullPath))
            {
                try { File.Delete(fullPath); } catch { /* best-effort cleanup */ }
            }
        }
    }
}
