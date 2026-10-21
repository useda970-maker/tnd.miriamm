using System;
using System.Collections.Generic;
using TiendaMiriam.Core.Enums;

namespace TiendaMiriam.Core.Entities
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; // SHA-256 / BCrypt
        public string Pin { get; set; } = "1234";
        public UserRole Role { get; set; } = UserRole.CAJERO;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Product
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ProductCategory Category { get; set; } = ProductCategory.ARTICULO_TIENDA;

        // Financials
        public decimal Price { get; set; } // Selling Price in Bs.
        public decimal CostPrice { get; set; } // Cost of Goods / Production cost in Bs.

        // Inventory
        public decimal Stock { get; set; } // Physical stock (or virtual calculation if PREPARADO)
        public string Unit { get; set; } = "un"; // Free unit: kg, g, lb, oz, L, ml, un, caja...
        public decimal MinStockAlert { get; set; } = 5;

        // Restriction flag: ¿Permitir venta directa al público en POS?
        // SÍ = Visible en catálogo del cajero
        // NO = Insumo/materia prima interna, oculto en POS pero disponible en recetas
        public bool ShowInPOS { get; set; } = true;

        // Multi-role capability (e.g. Insumo and/or Direct product)
        public bool CanBeUsedAsIngredient { get; set; } = false;

        // Frozen products and traceability
        public string? BatchNumber { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public bool IsSoldByWeight { get; set; } = false;
        public decimal? WeightKg { get; set; }

        public string? ColorTag { get; set; } = "#2563EB";
        public string? ImageUrl { get; set; }
        public string? Barcode { get; set; }

        // Unpack breakdown (e.g. 6-pack to 6 individual units)
        public string? UnpackTargetId { get; set; }
        public decimal? UnpackUnitsYield { get; set; }

        // Navigation properties
        public virtual ICollection<ProductPresentation> Presentations { get; set; } = new List<ProductPresentation>();
        public virtual ICollection<RecipeItem> RecipeItems { get; set; } = new List<RecipeItem>();
    }

    public class ProductPresentation
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ProductId { get; set; } = string.Empty;
        public virtual Product? Product { get; set; }

        public string Name { get; set; } = string.Empty; // e.g. "Caja Display x24", "Docena", "Por Mayor"
        public decimal Multiplier { get; set; } = 1; // e.g. 24
        public decimal Price { get; set; } // e.g. Bs. 118.00
        public string? Barcode { get; set; }
    }

    public class RecipeItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        // Parent Prepared Product
        public string ParentProductId { get; set; } = string.Empty;
        public virtual Product? ParentProduct { get; set; }

        // Consumed Raw Ingredient
        public string IngredientProductId { get; set; } = string.Empty;
        public virtual Product? IngredientProduct { get; set; }

        public string IngredientName { get; set; } = string.Empty;
        public decimal Quantity { get; set; } // e.g. 150 (g) or 1 (un) or 0.25 (kg)
        public string Unit { get; set; } = "un"; // Free unit consumed in recipe
    }

    public class Sale
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ReceiptNumber { get; set; } = string.Empty; // e.g. TM-1049
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.EFECTIVO;
        public decimal CashReceived { get; set; }
        public decimal Change { get; set; } // Cambio (no 'Vuelto')

        public string CashierName { get; set; } = string.Empty;
        public string? TableNumber { get; set; }
        public string? ClientId { get; set; }
        public virtual Client? Client { get; set; }

        public string Status { get; set; } = "COMPLETADA"; // COMPLETADA or ANULADA
        public bool IsSynced { get; set; } = true;

        public virtual ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
    }

    public class SaleItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SaleId { get; set; } = string.Empty;
        public virtual Sale? Sale { get; set; }

        public string ProductId { get; set; } = string.Empty;
        public virtual Product? Product { get; set; }

        public string ProductName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total => Quantity * UnitPrice;

        public string? PresentationId { get; set; }
        public string? PresentationName { get; set; }
        public string? Notes { get; set; }
    }

    public class CashSession
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ClosedAt { get; set; }

        public string OpenedBy { get; set; } = string.Empty;
        public string? ClosedBy { get; set; }

        public decimal InitialCash { get; set; } // Fondo inicial
        public bool IsOpen { get; set; } = true;

        public decimal CashSales { get; set; }
        public decimal DebtRepaymentsInCash { get; set; }
        public decimal CashExpenses { get; set; }
        public decimal GenericPurchasesInCash { get; set; }

        public decimal ExpectedCash => InitialCash + CashSales + DebtRepaymentsInCash - CashExpenses - GenericPurchasesInCash;
        public decimal? ActualCashCounted { get; set; }
        public decimal? Difference => ActualCashCounted.HasValue ? ActualCashCounted.Value - ExpectedCash : null;
        public string? ClosureNotes { get; set; }
    }

    public class CashClosing
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SessionCode { get; set; } = string.Empty;
        public DateTime OpenedAt { get; set; }
        public DateTime ClosedAt { get; set; }
        public string OpenedBy { get; set; } = string.Empty;
        public string ClosedBy { get; set; } = string.Empty;

        public decimal InitialCash { get; set; }
        public decimal ExpectedCash { get; set; }
        public decimal ActualCashCounted { get; set; }
        public decimal Difference { get; set; }
        public string Status { get; set; } = "CUADRADA"; // CUADRADA, SOBRANTE, FALTANTE
        public string? Notes { get; set; }
    }

    public class Client
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public decimal CreditLimit { get; set; } = 500;
        public decimal CurrentDebt { get; set; } = 0;
        public decimal WalletBalance { get; set; } = 0; // Saldo a favor / Monedero
        public DateTime? OldestDebtDate { get; set; }
    }

    public class AuditLog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string UserName { get; set; } = string.Empty;
        public AuditAction Action { get; set; }
        public string TargetItem { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string? PreviousValue { get; set; }
        public string? NewValue { get; set; }
        public string? Reason { get; set; }
    }
}
