using System;
using System.Collections.Generic;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;

namespace TiendaMiriam.WebDashboard.Models
{
    public class LoginViewModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
    }

    public class DashboardViewModel
    {
        public string OwnerName { get; set; } = "Doña Miriam Suárez";
        public decimal TotalSalesAmount { get; set; }
        public int TotalSalesCount { get; set; }
        public decimal TotalCOGS { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal GrossMarginPercent { get; set; }
        public decimal CurrentCashInRegister { get; set; }
        public bool IsCashRegisterOpen { get; set; }

        public IEnumerable<Sale> RecentSales { get; set; } = new List<Sale>();
        public IEnumerable<Product> TopProducts { get; set; } = new List<Product>();
        public Dictionary<PaymentMethod, decimal> PaymentDistribution { get; set; } = new();
    }

    public class ProductEditViewModel
    {
        public string? Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ProductCategory Category { get; set; } = ProductCategory.ARTICULO_TIENDA;
        public decimal Price { get; set; }
        public decimal CostPrice { get; set; }
        public decimal Stock { get; set; }
        public string Unit { get; set; } = "un";
        public decimal MinStockAlert { get; set; } = 5;

        // Restriction flag: ¿Permitir venta directa al público en POS?
        public bool ShowInPOS { get; set; } = true;
        public bool CanBeUsedAsIngredient { get; set; } = false;

        // Frozen
        public string? BatchNumber { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public bool IsSoldByWeight { get; set; }

        public string AuditReason { get; set; } = string.Empty;
        public List<ProductPresentation> Presentations { get; set; } = new();
    }

    public class RecipeEditViewModel
    {
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal SellingPrice { get; set; }
        public decimal CalculatedCostPrice { get; set; }

        public List<RecipeItemInputModel> Ingredients { get; set; } = new();
        public IEnumerable<Product> AvailableRawProducts { get; set; } = new List<Product>();
        public string AuditReason { get; set; } = "Ajuste de escandallo por el Dueño";
    }

    public class RecipeItemInputModel
    {
        public string IngredientProductId { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = "un";
    }
}
