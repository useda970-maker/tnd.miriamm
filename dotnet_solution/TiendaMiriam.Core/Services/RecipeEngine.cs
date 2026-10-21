using System;
using System.Collections.Generic;
using System.Linq;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;

namespace TiendaMiriam.Core.Services
{
    public interface IRecipeEngine
    {
        decimal CalculateProductionCost(Product product, IEnumerable<Product> allProducts);
        decimal CalculateVirtualStock(Product product, IEnumerable<Product> allProducts);
        void DeductInventoryForSale(Sale sale, IDictionary<string, Product> productCatalog);
    }

    public class RecipeEngine : IRecipeEngine
    {
        private readonly IUnitConversionService _conversionService;

        public RecipeEngine(IUnitConversionService conversionService)
        {
            _conversionService = conversionService;
        }

        public decimal CalculateProductionCost(Product product, IEnumerable<Product> allProducts)
        {
            if (product.RecipeItems == null || !product.RecipeItems.Any())
                return product.CostPrice;

            var catalog = allProducts.ToDictionary(p => p.Id);
            decimal totalCost = 0;

            foreach (var item in product.RecipeItems)
            {
                if (!catalog.TryGetValue(item.IngredientProductId, out var rawProduct))
                    continue;

                totalCost += _conversionService.CalculateIngredientCost(
                    rawProduct.Unit,
                    rawProduct.CostPrice,
                    item.Quantity,
                    item.Unit
                );
            }

            return Math.Round(totalCost, 2);
        }

        public decimal CalculateVirtualStock(Product product, IEnumerable<Product> allProducts)
        {
            if (product.Category != ProductCategory.PREPARADO || product.RecipeItems == null || !product.RecipeItems.Any())
                return product.Stock;

            var catalog = allProducts.ToDictionary(p => p.Id);
            decimal minPortions = decimal.MaxValue;

            foreach (var item in product.RecipeItems)
            {
                if (!catalog.TryGetValue(item.IngredientProductId, out var rawProduct))
                    continue;

                var neededInStockUnit = _conversionService.Convert(item.Quantity, item.Unit, rawProduct.Unit);
                if (neededInStockUnit <= 0) continue;

                var portions = Math.Floor(rawProduct.Stock / neededInStockUnit);
                if (portions < minPortions)
                {
                    minPortions = portions;
                }
            }

            return minPortions == decimal.MaxValue ? 0 : Math.Max(0, minPortions);
        }

        public void DeductInventoryForSale(Sale sale, IDictionary<string, Product> productCatalog)
        {
            foreach (var saleItem in sale.Items)
            {
                if (!productCatalog.TryGetValue(saleItem.ProductId, out var product))
                    continue;

                // Determine presentation multiplier (e.g. Caja de 24 -> 24)
                decimal multiplier = 1;
                if (!string.IsNullOrEmpty(saleItem.PresentationId))
                {
                    var pres = product.Presentations?.FirstOrDefault(p => p.Id == saleItem.PresentationId);
                    if (pres != null)
                    {
                        multiplier = pres.Multiplier;
                    }
                }

                if (product.Category == ProductCategory.PREPARADO && product.RecipeItems != null && product.RecipeItems.Any())
                {
                    // Atomic deduction of raw ingredients with unit conversions
                    foreach (var recipeItem in product.RecipeItems)
                    {
                        if (productCatalog.TryGetValue(recipeItem.IngredientProductId, out var rawProduct))
                        {
                            var totalRecipeQuantity = recipeItem.Quantity * saleItem.Quantity * multiplier;
                            var convertedDeduction = _conversionService.Convert(totalRecipeQuantity, recipeItem.Unit, rawProduct.Unit);

                            rawProduct.Stock = Math.Round(rawProduct.Stock - convertedDeduction, 4);
                        }
                    }
                }
                else
                {
                    // Direct item or frozen product deduction (permits negative stock in peak hours)
                    var totalUnits = saleItem.Quantity * multiplier;
                    product.Stock = Math.Round(product.Stock - totalUnits, 3);
                }
            }
        }
    }
}
