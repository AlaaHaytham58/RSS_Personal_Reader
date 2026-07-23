using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Configuration;
using Microsoft.Extensions.Logging;

namespace Services
{
    public class EmailSenderService : IEmailSender
    {
        private readonly SmtpSettings _settings;
        private readonly ILogger<EmailSenderService> _logger;

        public EmailSenderService(AppSettings appSettings, ILogger<EmailSenderService> logger)
        {
            _settings = appSettings.Smtp;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string plainTextBody)
        {
            if (string.IsNullOrWhiteSpace(_settings.Host))
            {
                // No SMTP configured yet (e.g. local dev without a .env). Log instead of
                // throwing so forgot-password requests still return their generic response.
                _logger.LogWarning("SMTP is not configured; skipping email to {ToEmail} with subject {Subject}", toEmail, subject);
                return;
            }

            using var message = new MailMessage
            {
                From = new MailAddress(_settings.FromAddress, _settings.FromName),
                Subject = subject,
                Body = plainTextBody,
                IsBodyHtml = false,
            };
            message.To.Add(toEmail);

            using var client = new SmtpClient(_settings.Host, _settings.Port)
            {
                EnableSsl = _settings.EnableSsl,
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
            };

            try
            {
                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            }
        }
    }
}
