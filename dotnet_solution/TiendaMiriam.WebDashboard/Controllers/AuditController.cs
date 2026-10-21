using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Infrastructure.Data;

namespace TiendaMiriam.WebDashboard.Controllers
{
    [Authorize(Roles = "ADMIN")]
    public class AuditController : Controller
    {
        private readonly TiendaMiriamDbContext _context;

        public AuditController(TiendaMiriamDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(100)
                .ToListAsync();

            return View(logs);
        }
    }
}
