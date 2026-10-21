using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;
using TiendaMiriam.Core.Services;
using TiendaMiriam.Infrastructure.Data;
using TiendaMiriam.WebDashboard.Models;

namespace TiendaMiriam.WebDashboard.Controllers
{
    [Authorize(Roles = "ADMIN")]
    public class RecipesController : Controller
    {
        private readonly TiendaMiriamDbContext _context;
        private readonly IUnitConversionService _conversionService;

        public RecipesController(TiendaMiriamDbContext context, IUnitConversionService conversionService)
        {
            _context = context;
            _conversionService = conversionService;
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string productId)
        {
            var product = await _context.Products
                .Include(p => p.RecipeItems)
                    .ThenInclude(r => r.IngredientProduct)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null) return NotFound();

            var availableRaw = await _context.Products
                .Where(p => p.CanBeUsedAsIngredient || p.Category == ProductCategory.INSUMO_CRUDO)
                .OrderBy(p => p.Name)
                .ToListAsync();

            var vm = new RecipeEditViewModel
            {
                ProductId = product.Id,
                ProductName = product.Name,
                SellingPrice = product.Price,
                CalculatedCostPrice = product.CostPrice,
                AvailableRawProducts = availableRaw,
                Ingredients = product.RecipeItems.Select(r => new RecipeItemInputModel
                {
                    IngredientProductId = r.IngredientProductId,
                    Quantity = r.Quantity,
                    Unit = r.Unit
                }).ToList()
            };

            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Save(RecipeEditViewModel model)
        {
            var product = await _context.Products
                .Include(p => p.RecipeItems)
                .FirstOrDefaultAsync(p => p.Id == model.ProductId);

            if (product == null) return NotFound();

            // Clear previous recipe items
            _context.RecipeItems.RemoveRange(product.RecipeItems);

            decimal totalCost = 0;
            var newItems = new List<RecipeItem>();

            foreach (var input in model.Ingredients)
            {
                if (string.IsNullOrEmpty(input.IngredientProductId) || input.Quantity <= 0)
                    continue;

                var rawProduct = await _context.Products.FindAsync(input.IngredientProductId);
                if (rawProduct == null) continue;

                var cost = _conversionService.CalculateIngredientCost(
                    rawProduct.Unit,
                    rawProduct.CostPrice,
                    input.Quantity,
                    input.Unit
                );

                totalCost += cost;

                newItems.Add(new RecipeItem
                {
                    ParentProductId = product.Id,
                    IngredientProductId = rawProduct.Id,
                    IngredientName = rawProduct.Name,
                    Quantity = input.Quantity,
                    Unit = input.Unit
                });
            }

            product.RecipeItems = newItems;
            var oldCost = product.CostPrice;
            product.CostPrice = Math.Round(totalCost, 2);

            _context.AuditLogs.Add(new AuditLog
            {
                UserName = User.Identity?.Name ?? "Dueño",
                Action = AuditAction.RECETA_MODIFICADA,
                TargetItem = product.Name,
                Details = $"Modificación de escandallo libre: {newItems.Count} ingredientes. Costo unitario recalculado: Bs. {product.CostPrice:F2}",
                PreviousValue = $"Bs. {oldCost:F2}",
                NewValue = $"Bs. {product.CostPrice:F2}",
                Reason = string.IsNullOrWhiteSpace(model.AuditReason) ? "Actualización de escandallo técnico" : model.AuditReason
            });

            await _context.SaveChangesAsync();
            return RedirectToAction("Index", "Products");
        }
    }
}
