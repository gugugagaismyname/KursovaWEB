using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleTODOLesson.Server.Data;
using SimpleTODOLesson.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace SimpleTODOLesson.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AccountController> _logger;

        public AccountController(ILogger<AccountController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public class RegisterModel
        {
            [Required] public string? Username { get; set; }
            [Required][EmailAddress] public string? Email { get; set; }
            [Required][MinLength(6)] public string? Password { get; set; }
        }

        public class LoginModel
        {
            [Required][EmailAddress] public string? Email { get; set; }
            [Required] public string? Password { get; set; }
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterModel model)
        {
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                return BadRequest(new { message = "Email already in use" });

            if (await _context.Users.AnyAsync(u => u.Username == model.Username))
                return BadRequest(new { message = "Username already in use" });

            var newUser = new User
            {
                Username = model.Username,
                Email = model.Email
            };

            newUser.SetPassword(model.Password!);

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registered" });
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginModel model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || !user.VerifyPassword(model.Password!))
                return Unauthorized(new { message = "Invalid credentials." });

            HttpContext.Session.SetInt32("UserId", user.Id);

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                role = user.Role
            });
        }

        [HttpPost("Logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok();
        }

        [HttpGet("Me")]
        public async Task<IActionResult> Me()
        {
            int? id = HttpContext.Session.GetInt32("UserId");
            if (id == null) return Unauthorized();

            var user = await _context.Users.FindAsync(id.Value);

            return Ok(new
            {
                id = user!.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role
            });
        }
    }
}
