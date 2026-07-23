using System.Threading.Tasks;

namespace Services
{
    public interface IEmailSender
    {
        Task SendAsync(string toEmail, string subject, string plainTextBody);
    }
}
