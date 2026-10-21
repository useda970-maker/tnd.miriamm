using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;
using TiendaMiriam.Infrastructure.Data;
using TiendaMiriam.WebDashboard.Models;

namespace TiendaMiriam.WebDashboard.Controllers
{
    public class AccountController : Controller
    {
        private readonly TiendaMiriamDbContext _context;

        public AccountController(TiendaMiriamDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View(new LoginViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == model.Username && u.IsActive);
            if (user == null || !VerifyPassword(model.Password, user.PasswordHash))
            {
                model.ErrorMessage = "Credenciales incorrectas. Verifique su usuario y contraseña.";
                return View(model);
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Name, user.FullName),
                new(ClaimTypes.Role, user.Role.ToString()),
                new("Username", user.Username)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(12)
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            // Log successful login in forensic audit
            _context.AuditLogs.Add(new AuditLog
            {
                UserName = user.FullName,
                Action = AuditAction.LOGIN_USUARIO,
                TargetItem = "Panel Web Empresarial",
                Details = $"Inicio de sesión exitoso con rol: {user.Role}",
                Reason = "Acceso a plataforma web"
            });
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                return Redirect(returnUrl);

            return RedirectToAction("Index", "Dashboard");
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }

        private static bool VerifyPassword(string inputPassword, string storedHash)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(inputPassword);
            var computedHash = Convert.ToBase64String(sha256.ComputeHash(bytes));
            return computedHash == storedHash;
        }
    }
}
