using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Services;
using TiendaMiriam.Infrastructure.Data;

namespace TiendaMiriam.WebDashboard.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class PosSyncApiController : ControllerBase
    {
        private readonly TiendaMiriamDbContext _context;
        private readonly IRecipeEngine _recipeEngine;

        public PosSyncApiController(TiendaMiriamDbContext context, IRecipeEngine recipeEngine)
        {
            _context = context;
            _recipeEngine = recipeEngine;
        }

        // GET: api/PosSyncApi/catalog (Desktop POS downloads updated products & recipes from Owner Web Dashboard)
        [HttpGet("catalog")]
        public async Task<IActionResult> GetCatalog()
        {
            var products = await _context.Products
                .Include(p => p.Presentations)
                .Include(p => p.RecipeItems)
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/PosSyncApi/sync-sales (Desktop POS uploads offline sales queue)
        [HttpPost("sync-sales")]
        public async Task<IActionResult> SyncSales([FromBody] List<Sale> sales)
        {
            if (sales == null || !sales.Any())
                return BadRequest("No sales payload provided.");

            var allProducts = await _context.Products
                .Include(p => p.Presentations)
                .Include(p => p.RecipeItems)
                .ToDictionaryAsync(p => p.Id);

            int syncedCount = 0;
            foreach (var sale in sales)
            {
                var exists = await _context.Sales.AnyAsync(s => s.ReceiptNumber == sale.ReceiptNumber);
                if (exists) continue;

                // Atomic deduction in cloud database
                _recipeEngine.DeductInventoryForSale(sale, allProducts);
                sale.IsSynced = true;
                _context.Sales.Add(sale);
                syncedCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, syncedSalesCount = syncedCount, message = $"Sincronizadas {syncedCount} ventas desde POS offline." });
        }
    }
}
