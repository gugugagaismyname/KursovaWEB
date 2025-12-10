using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleTODOLesson.Server.Data;
using SimpleTODOLesson.Server.Models;

namespace SimpleTODOLesson.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{articleId}")]
        public async Task<IActionResult> GetComments(int articleId)
        {
            var comments = await _context.Comments
                .Where(c => c.ArticleId == articleId)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedDate)
                .ToListAsync();

            return Ok(comments.Select(c => new {
                c.Id,
                c.Content,
                c.CreatedDate,
                user = c.User.Username
            }));
        }

        [HttpPost("{articleId}")]
        public async Task<IActionResult> AddComment(int articleId, [FromBody] string content)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            var comment = new Comment
            {
                ArticleId = articleId,
                UserId = userId.Value,
                Content = content
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);

            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return NotFound();

            if (user.Role != "admin" && comment.UserId != userId)
                return Forbid();

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
