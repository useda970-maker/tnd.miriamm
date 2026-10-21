using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;
using TiendaMiriam.Infrastructure.Data;
using TiendaMiriam.WebDashboard.Models;

namespace TiendaMiriam.WebDashboard.Controllers
{
    [Authorize(Roles = "ADMIN")]
    public class ProductsController : Controller
    {
        private readonly TiendaMiriamDbContext _context;

        public ProductsController(TiendaMiriamDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(string? search, ProductCategory? category, bool? showInPos)
        {
            var query = _context.Products.Include(p => p.Presentations).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()) || p.Code.ToLower().Contains(search.ToLower()));
            }

            if (category.HasValue)
            {
                query = query.Where(p => p.Category == category.Value);
            }

            if (showInPos.HasValue)
            {
                query = query.Where(p => p.ShowInPOS == showInPos.Value);
            }

            var products = await query.OrderBy(p => p.Name).ToListAsync();
            return View(products);
        }

        [HttpGet]
        public IActionResult Create()
        {
            var randomCode = $"PRD-{Random.Shared.Next(100, 999)}";
            return View("CreateOrEdit", new ProductEditViewModel
            {
                Code = randomCode,
                ShowInPOS = true,
                Unit = "un",
                Price = 10m,
                CostPrice = 5m,
                Stock = 10m,
                AuditReason = "Alta de producto por el Dueño"
            });
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            var product = await _context.Products
                .Include(p => p.Presentations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            var vm = new ProductEditViewModel
            {
                Id = product.Id,
                Code = product.Code,
                Name = product.Name,
                Category = product.Category,
                Price = product.Price,
                CostPrice = product.CostPrice,
                Stock = product.Stock,
                Unit = product.Unit,
                MinStockAlert = product.MinStockAlert,
                ShowInPOS = product.ShowInPOS,
                CanBeUsedAsIngredient = product.CanBeUsedAsIngredient,
                BatchNumber = product.BatchNumber,
                ExpirationDate = product.ExpirationDate,
                IsSoldByWeight = product.IsSoldByWeight,
                Presentations = product.Presentations.ToList(),
                AuditReason = ""
            };

            return View("CreateOrEdit", vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Save(ProductEditViewModel model)
        {
            if (!ModelState.IsValid)
                return View("CreateOrEdit", model);

            var userName = User.Identity?.Name ?? "Dueño (Admin)";

            if (string.IsNullOrEmpty(model.Id))
            {
                // Create
                var product = new Product
                {
                    Code = model.Code,
                    Name = model.Name,
                    Category = model.Category,
                    Price = model.Price,
                    CostPrice = model.CostPrice,
                    Stock = model.Stock,
                    Unit = model.Unit,
                    MinStockAlert = model.MinStockAlert,
                    ShowInPOS = model.ShowInPOS,
                    CanBeUsedAsIngredient = model.CanBeUsedAsIngredient,
                    BatchNumber = model.BatchNumber,
                    ExpirationDate = model.ExpirationDate,
                    IsSoldByWeight = model.IsSoldByWeight
                };

                _context.Products.Add(product);
                _context.AuditLogs.Add(new AuditLog
                {
                    UserName = userName,
                    Action = AuditAction.STOCK_AJUSTADO,
                    TargetItem = product.Name,
                    Details = $"Alta de nuevo producto {product.Code} con unidad {product.Unit}, venta POS: {(product.ShowInPOS ? "Sí" : "No")}",
                    NewValue = $"Precio: Bs. {product.Price:F2}",
                    Reason = string.IsNullOrWhiteSpace(model.AuditReason) ? "Nuevo producto" : model.AuditReason
                });
            }
            else
            {
                // Update
                var existing = await _context.Products.FindAsync(model.Id);
                if (existing == null) return NotFound();

                var oldPrice = existing.Price;
                var oldCost = existing.CostPrice;

                existing.Code = model.Code;
                existing.Name = model.Name;
                existing.Category = model.Category;
                existing.Price = model.Price;
                existing.CostPrice = model.CostPrice;
                existing.Stock = model.Stock;
                existing.Unit = model.Unit;
                existing.MinStockAlert = model.MinStockAlert;
                existing.ShowInPOS = model.ShowInPOS;
                existing.CanBeUsedAsIngredient = model.CanBeUsedAsIngredient;
                existing.BatchNumber = model.BatchNumber;
                existing.ExpirationDate = model.ExpirationDate;
                existing.IsSoldByWeight = model.IsSoldByWeight;

                _context.AuditLogs.Add(new AuditLog
                {
                    UserName = userName,
                    Action = AuditAction.PRECIO_MODIFICADO,
                    TargetItem = existing.Name,
                    Details = $"Actualización integral de producto. Precio: {oldPrice:F2} -> {existing.Price:F2}, Costo: {oldCost:F2} -> {existing.CostPrice:F2}, POS: {(existing.ShowInPOS ? "Visible" : "Oculto")}",
                    PreviousValue = $"Bs. {oldPrice:F2}",
                    NewValue = $"Bs. {existing.Price:F2}",
                    Reason = string.IsNullOrWhiteSpace(model.AuditReason) ? "Modificación administrativa" : model.AuditReason
                });
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id, string reason)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            var isUsedInRecipe = await _context.RecipeItems.AnyAsync(r => r.IngredientProductId == id);
            if (isUsedInRecipe)
            {
                TempData["ErrorMessage"] = $"No se puede eliminar '{product.Name}' porque es insumo activo de recetas en el escandallo.";
                return RedirectToAction(nameof(Index));
            }

            _context.Products.Remove(product);
            _context.AuditLogs.Add(new AuditLog
            {
                UserName = User.Identity?.Name ?? "Dueño",
                Action = AuditAction.STOCK_AJUSTADO,
                TargetItem = product.Name,
                Details = $"Producto eliminado del catálogo comercial. Stock final: {product.Stock} {product.Unit}",
                Reason = string.IsNullOrWhiteSpace(reason) ? "Eliminado por el Dueño" : reason
            });

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
    }
}
