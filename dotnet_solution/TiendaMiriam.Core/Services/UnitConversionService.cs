using System;
using System.Collections.Generic;
using TiendaMiriam.Core.Enums;

namespace TiendaMiriam.Core.Services
{
    public interface IUnitConversionService
    {
        string NormalizeUnit(string unit);
        decimal Convert(decimal amount, string fromUnit, string toUnit, decimal customMultiplier = 1);
        decimal CalculateIngredientCost(string rawStockUnit, decimal rawCostPrice, decimal recipeQuantity, string recipeUnit);
    }

    public class UnitConversionService : IUnitConversionService
    {
        // Factors to base units: Masa -> Gramos (g); Volumen -> Mililitros (ml); Discreto -> 1
        private static readonly Dictionary<string, (UnitType Type, decimal Factor)> UnitRegistry =
            new(StringComparer.OrdinalIgnoreCase)
            {
                // Masa (Base: Gramos)
                { "kg", (UnitType.MASA, 1000m) },
                { "g", (UnitType.MASA, 1m) },
                { "lb", (UnitType.MASA, 453.59237m) },
                { "oz", (UnitType.MASA, 28.34952m) },

                // Volumen (Base: Mililitros)
                { "L", (UnitType.VOLUMEN, 1000m) },
                { "ml", (UnitType.VOLUMEN, 1m) },

                // Discretas
                { "un", (UnitType.DISCRETO, 1m) },
                { "caja", (UnitType.DISCRETO, 1m) },
                { "paquete", (UnitType.DISCRETO, 1m) },
                { "blister", (UnitType.DISCRETO, 1m) },
                { "porcion", (UnitType.DISCRETO, 1m) }
            };

        public string NormalizeUnit(string unit)
        {
            if (string.IsNullOrWhiteSpace(unit)) return "un";
            var clean = unit.Trim().ToLowerInvariant();
            if (clean is "kg" or "kilo" or "kilogramo" or "kilogramos") return "kg";
            if (clean is "g" or "gr" or "gramo" or "gramos") return "g";
            if (clean is "lb" or "libra" or "libras") return "lb";
            if (clean is "oz" or "onza" or "onzas") return "oz";
            if (clean is "l" or "lt" or "litro" or "litros") return "L";
            if (clean is "ml" or "mililitro" or "mililitros" or "cc") return "ml";
            if (clean is "un" or "u" or "unidad" or "unidades") return "un";
            if (clean.Contains("caja")) return "caja";
            if (clean.Contains("paquete") || clean.Contains("pack")) return "paquete";
            if (clean.Contains("blister") || clean.Contains("blíster")) return "blister";
            if (clean.Contains("porcion") || clean.Contains("porción")) return "porcion";
            return clean;
        }

        public decimal Convert(decimal amount, string fromUnit, string toUnit, decimal customMultiplier = 1)
        {
            var normFrom = NormalizeUnit(fromUnit);
            var normTo = NormalizeUnit(toUnit);

            if (normFrom.Equals(normTo, StringComparison.OrdinalIgnoreCase))
                return amount;

            var hasFrom = UnitRegistry.TryGetValue(normFrom, out var defFrom);
            var hasTo = UnitRegistry.TryGetValue(normTo, out var defTo);

            if (hasFrom && hasTo && defFrom.Type == defTo.Type)
            {
                // Convert fromUnit to base factor, then base factor to toUnit
                var inBase = amount * defFrom.Factor;
                return inBase / defTo.Factor;
            }

            if (customMultiplier > 0)
            {
                return amount * customMultiplier;
            }

            return amount;
        }

        public decimal CalculateIngredientCost(string rawStockUnit, decimal rawCostPrice, decimal recipeQuantity, string recipeUnit)
        {
            var quantityInStockUnit = Convert(recipeQuantity, recipeUnit, rawStockUnit);
            return Math.Round(quantityInStockUnit * rawCostPrice, 4);
        }
    }
}
