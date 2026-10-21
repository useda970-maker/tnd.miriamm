using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Infrastructure.Data;

namespace TiendaMiriam.WebDashboard.Controllers
{
    [Authorize(Roles = "ADMIN")]
    public class CashController : Controller
    {
        private readonly TiendaMiriamDbContext _context;

        public CashController(TiendaMiriamDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var activeSession = await _context.CashSessions
                .OrderByDescending(c => c.OpenedAt)
                .FirstOrDefaultAsync();

            var closings = await _context.CashClosings
                .OrderByDescending(c => c.ClosedAt)
                .Take(30)
                .ToListAsync();

            ViewBag.ActiveSession = activeSession;
            return View(closings);
        }
    }
}
