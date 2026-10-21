using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Enums;
using TiendaMiriam.Infrastructure.Data;
using TiendaMiriam.WebDashboard.Models;

namespace TiendaMiriam.WebDashboard.Controllers
{
    [Authorize(Roles = "ADMIN")]
    public class DashboardController : Controller
    {
        private readonly TiendaMiriamDbContext _context;

        public DashboardController(TiendaMiriamDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var sales = await _context.Sales
                .Include(s => s.Items)
                    .ThenInclude(i => i.Product)
                .OrderByDescending(s => s.Timestamp)
                .ToListAsync();

            var completedSales = sales.Where(s => s.Status == "COMPLETADA").ToList();

            var totalSalesAmount = completedSales.Sum(s => s.Total);
            var totalSalesCount = completedSales.Count;

            decimal totalCOGS = 0;
            foreach (var sale in completedSales)
            {
                foreach (var item in sale.Items)
                {
                    totalCOGS += (item.Product?.CostPrice ?? 0) * item.Quantity;
                }
            }

            var grossProfit = Math.Max(0, totalSalesAmount - totalCOGS);
            var grossMarginPercent = totalSalesAmount > 0 ? (grossProfit / totalSalesAmount) * 100 : 0;

            var activeCashSession = await _context.CashSessions
                .OrderByDescending(c => c.OpenedAt)
                .FirstOrDefaultAsync();

            var currentCash = activeCashSession?.ExpectedCash ?? 0;
            var isCashOpen = activeCashSession?.IsOpen ?? false;

            var paymentDist = completedSales
                .GroupBy(s => s.PaymentMethod)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.Total));

            var topProducts = await _context.Products
                .Where(p => p.Category == ProductCategory.PREPARADO || p.Category == ProductCategory.ARTICULO_TIENDA)
                .OrderByDescending(p => p.Price - p.CostPrice)
                .Take(5)
                .ToListAsync();

            var viewModel = new DashboardViewModel
            {
                OwnerName = User.Identity?.Name ?? "Doña Miriam Suárez",
                TotalSalesAmount = totalSalesAmount,
                TotalSalesCount = totalSalesCount,
                TotalCOGS = totalCOGS,
                GrossProfit = grossProfit,
                GrossMarginPercent = Math.Round(grossMarginPercent, 1),
                CurrentCashInRegister = currentCash,
                IsCashRegisterOpen = isCashOpen,
                RecentSales = sales.Take(10),
                TopProducts = topProducts,
                PaymentDistribution = paymentDist
            };

            return View(viewModel);
        }
    }
}
