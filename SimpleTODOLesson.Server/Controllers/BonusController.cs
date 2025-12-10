using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleTODOLesson.Server.Data;
using SimpleTODOLesson.Server.Models;

namespace SimpleTODOLesson.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BonusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BonusController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBonuses()
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            return Ok(await _context.Bonuses
                .OrderByDescending(b => b.CreatedDate)
                .ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> AddBonus(Bonus b)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user.Role != "admin") return Forbid();

            _context.Bonuses.Add(b);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBonus(int id)
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user.Role != "admin") return Forbid();

            var item = await _context.Bonuses.FindAsync(id);
            if (item == null) return NotFound();

            _context.Bonuses.Remove(item);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
