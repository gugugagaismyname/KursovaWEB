using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleTODOLesson.Server.Data;
using SimpleTODOLesson.Server.Models;

namespace SimpleTODOLesson.Server.Controllers
{
    [ApiController]
    [Route("[controller]")] // тут шлях /article відповідно
    public class ArticleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ArticleController> _logger;

        public ArticleController(ILogger<ArticleController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<Article>> GetArticles()
        {
            _logger.LogInformation("Retrieving all articles from database.");

            // Всі статті, сортуючи за датою створення (найновіші перші)
            return await _context.Articles
                                 .OrderByDescending(a => a.CreatedDate)
                                 .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Article>> PostArticle(Article article)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId.Value);
            if (user.Role != "admin") return Forbid();

            article.CreatedDate = DateTime.UtcNow;

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetArticles), new { id = article.Id }, article);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutArticle(int id, Article article)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId.Value);
            if (user.Role != "admin") return Forbid();

            // 1. Перевірка, чи Id у маршруті відповідає Id об'єкта
            if (id != article.Id)
            {
                return BadRequest("Article ID mismatch.");
            }

            // 2. Встановлюємо стан сутності як "змінений"
            _context.Entry(article).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Article updated: {Id}", id);
            }
            catch (DbUpdateConcurrencyException)
            {
                // Чи існує запис
                if (!_context.Articles.Any(e => e.Id == id))
                {
                    return NotFound(); // Якщо не існує, то 404
                }
                else
                {
                    throw;
                }
            }

            // 3. Успішне оновлення повертає 204
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArticle(int id)
        {

            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId.Value);
            if (user.Role != "admin") return Forbid();

            // Сстаттю за Id
            var article = await _context.Articles.FindAsync(id);

            if (article == null)
            {
                return NotFound();
            }

            // Видаляємо та зберігаємо зміни
            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Article deleted: {Id}", id);

            // Успішне видалення повертає 204
            return NoContent();
        }
    }
}