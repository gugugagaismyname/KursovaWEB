using System.ComponentModel.DataAnnotations;

namespace SimpleTODOLesson.Server.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string? Username { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        // Зберігаємо лише хеш пароля, а не сам пароль
        [Required]
        public string? PasswordHash { get; set; }

        // Ролі "admin" та "user" (він за замовчуванням)
        [Required]
        public string? Role { get; set; } = "user";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Хешування пароля перед збереженням у БД
        public void SetPassword(string password)
        {
            // Використовуємо BCrypt для безпечного хешування (зі сіллю)
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Перевірка пароля
        public bool VerifyPassword(string password)
        {
            // Порівнюємо введений пароль із збереженим хешем
            return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
        }
    }
}