using System;
using System.Collections.Generic;
using System.Linq;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;
using TiendaMiriam.Core.Services;

namespace TiendaMiriam.POS.Services
{
    public class CartLineItem
    {
        public Product Product { get; set; } = null!;
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public string? PresentationId { get; set; }
        public string? PresentationName { get; set; }
        public decimal Total => Quantity * UnitPrice;
    }

    public class PosCartManager
    {
        private readonly List<CartLineItem> _items = new();
        private readonly IRecipeEngine _recipeEngine;

        public PosCartManager(IRecipeEngine recipeEngine)
        {
            _recipeEngine = recipeEngine;
        }

        public IReadOnlyList<CartLineItem> Items => _items.AsReadOnly();
        public decimal Subtotal => _items.Sum(i => i.Total);
        public decimal Discount { get; set; } = 0;
        public decimal Total => Math.Max(0, Subtotal - Discount);

        public void AddItem(Product product, decimal quantity = 1, ProductPresentation? presentation = null)
        {
            var existing = _items.FirstOrDefault(i => i.Product.Id == product.Id && i.PresentationId == presentation?.Id);
            var unitPrice = presentation?.Price ?? product.Price;

            if (existing != null)
            {
                existing.Quantity += quantity;
            }
            else
            {
                _items.Add(new CartLineItem
                {
                    Product = product,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    PresentationId = presentation?.Id,
                    PresentationName = presentation?.Name
                });
            }
        }

        public void RemoveItem(int index)
        {
            if (index >= 0 && index < _items.Count)
            {
                _items.RemoveAt(index);
            }
        }

        public void Clear()
        {
            _items.Clear();
            Discount = 0;
        }

        public Sale BuildSale(string receiptNumber, PaymentMethod paymentMethod, decimal cashReceived, string cashierName, string? tableNumber = null, string? clientId = null)
        {
            var change = (paymentMethod == PaymentMethod.EFECTIVO) ? Math.Max(0, cashReceived - Total) : 0;

            var sale = new Sale
            {
                ReceiptNumber = receiptNumber,
                Timestamp = DateTime.UtcNow,
                Subtotal = Subtotal,
                Discount = Discount,
                Total = Total,
                PaymentMethod = paymentMethod,
                CashReceived = cashReceived,
                Change = change,
                CashierName = cashierName,
                TableNumber = tableNumber,
                ClientId = clientId,
                Status = "COMPLETADA",
                IsSynced = false, // Outbox sync flag
                Items = _items.Select(i => new SaleItem
                {
                    ProductId = i.Product.Id,
                    ProductName = i.Product.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    PresentationId = i.PresentationId,
                    PresentationName = i.PresentationName
                }).ToList()
            };

            return sale;
        }
    }
}
