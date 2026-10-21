using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;

namespace TiendaMiriam.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(TiendaMiriamDbContext context)
        {
            context.Database.EnsureCreated();

            // Check if DB already seeded
            if (context.Users.Any())
            {
                return; // DB already seeded
            }

            // 1. SEED USERS & ROLES
            var adminUser = new User
            {
                Id = "usr-owner-001",
                Username = "miriam",
                FullName = "Miriam Suárez",
                PasswordHash = HashPassword("Miriam2026!"),
                Pin = "1234",
                Role = UserRole.ADMIN,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var cashierUser = new User
            {
                Id = "usr-cashier-001",
                Username = "cajero",
                FullName = "Cajero Turno Mañana",
                PasswordHash = HashPassword("Caja2026!"),
                Pin = "0000",
                Role = UserRole.CAJERO,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(adminUser, cashierUser);
            context.SaveChanges();

            // 2. SEED INSUMOS CRUDOS (Raw Materials - ShowInPOS = false)
            var rawPapa = new Product
            {
                Id = "raw-papa",
                Code = "INS-001",
                Name = "Papa Holandesa para Freír",
                Category = ProductCategory.INSUMO_CRUDO,
                Price = 0,
                CostPrice = 5.50m,
                Stock = 45.5m,
                Unit = "kg",
                ShowInPOS = false, // Insumo interno de cocina: oculto en POS
                CanBeUsedAsIngredient = true,
                ColorTag = "#CA8A04",
                MinStockAlert = 10
            };

            var rawCarne = new Product
            {
                Id = "raw-carne-molida",
                Code = "INS-002",
                Name = "Carne Molida Especial para Hamburguesas y Asaditos",
                Category = ProductCategory.INSUMO_CRUDO,
                Price = 0,
                CostPrice = 32.00m,
                Stock = 25.0m,
                Unit = "kg",
                ShowInPOS = false,
                CanBeUsedAsIngredient = true,
                ColorTag = "#DC2626",
                MinStockAlert = 6
            };

            var rawSalchicha = new Product
            {
                Id = "raw-salchicha",
                Code = "INS-003",
                Name = "Salchicha Vienesa Parrillera",
                Category = ProductCategory.INSUMO_CRUDO,
                Price = 0,
                CostPrice = 22.00m,
                Stock = 18.0m,
                Unit = "kg",
                ShowInPOS = false,
                CanBeUsedAsIngredient = true,
                ColorTag = "#EA580C",
                MinStockAlert = 5
            };

            var rawAceite = new Product
            {
                Id = "raw-aceite",
                Code = "INS-004",
                Name = "Aceite Vegetal de Cocina",
                Category = ProductCategory.INSUMO_CRUDO,
                Price = 0,
                CostPrice = 12.00m,
                Stock = 30.0m,
                Unit = "L",
                ShowInPOS = false,
                CanBeUsedAsIngredient = true,
                ColorTag = "#F59E0B",
                MinStockAlert = 8
            };

            var rawYuca = new Product
            {
                Id = "raw-yuca",
                Code = "INS-005",
                Name = "Yuca Fresca Pelada",
                Category = ProductCategory.INSUMO_CRUDO,
                Price = 0,
                CostPrice = 4.50m,
                Stock = 20.0m,
                Unit = "kg",
                ShowInPOS = false,
                CanBeUsedAsIngredient = true,
                ColorTag = "#D97706",
                MinStockAlert = 5
            };

            context.Products.AddRange(rawPapa, rawCarne, rawSalchicha, rawAceite, rawYuca);
            context.SaveChanges();

            // 3. SEED CONGELADOS (Frozen Products with Batch, Weight & Multifunction)
            var frzAsadito = new Product
            {
                Id = "frz-asadito",
                Code = "FRZ-001",
                Name = "Asadito de Carne Congelado (Intermedio)",
                Category = ProductCategory.CONGELADO_LOTE,
                Price = 8.00m,
                CostPrice = 3.84m,
                Stock = 35m,
                Unit = "un",
                ShowInPOS = true, // Se puede vender directo para llevar
                CanBeUsedAsIngredient = true, // Se consume como insumo en el plato preparado
                ColorTag = "#9333EA",
                MinStockAlert = 10,
                BatchNumber = "LOT-ASD-2026-01",
                ExpirationDate = DateTime.UtcNow.AddMonths(3)
            };

            var frzPavo = new Product
            {
                Id = "frz-pavo-entero",
                Code = "FRZ-002",
                Name = "Pavo Entero Horneable Congelado",
                Category = ProductCategory.CONGELADO_LOTE,
                Price = 45.00m, // Precio por kilogramo
                CostPrice = 28.00m,
                Stock = 38.5m, // 38.5 kg en congelador
                Unit = "kg",
                ShowInPOS = true,
                CanBeUsedAsIngredient = true,
                IsSoldByWeight = true,
                WeightKg = 38.5m,
                BatchNumber = "LOT-PV-2026-X11",
                ExpirationDate = DateTime.UtcNow.AddMonths(6),
                ColorTag = "#7C3AED",
                MinStockAlert = 10,
                Presentations = new List<ProductPresentation>
                {
                    new() { Name = "Por Kilo Pesado", Multiplier = 1m, Price = 45.00m },
                    new() { Name = "Pieza Entera Mediana (~4.5 kg)", Multiplier = 4.5m, Price = 195.00m }
                }
            };

            context.Products.AddRange(frzAsadito, frzPavo);
            context.SaveChanges();

            // 4. SEED ARTICULOS DE TIENDA (Multiformato Oreo & Bebidas)
            var storeOreo = new Product
            {
                Id = "store-oreo",
                Code = "TND-001",
                Name = "Galletas Oreo Original (Multiformato)",
                Category = ProductCategory.ARTICULO_TIENDA,
                Price = 5.50m,
                CostPrice = 3.50m,
                Stock = 72m,
                Unit = "un",
                ShowInPOS = true,
                CanBeUsedAsIngredient = true, // Multifunción: Venta al público o insumo de repostería
                ColorTag = "#2563EB",
                MinStockAlert = 12,
                Presentations = new List<ProductPresentation>
                {
                    new() { Name = "Unidad Suelta (108g)", Multiplier = 1m, Price = 5.50m },
                    new() { Name = "Caja Display x24 Unidades", Multiplier = 24m, Price = 118.00m },
                    new() { Name = "Paquete x4 Unidades", Multiplier = 4m, Price = 20.00m }
                }
            };

            var storeCoca = new Product
            {
                Id = "store-coca-individual",
                Code = "TND-002",
                Name = "Soda Coca-Cola 500ml",
                Category = ProductCategory.ARTICULO_TIENDA,
                Price = 7.00m,
                CostPrice = 4.80m,
                Stock = 30m,
                Unit = "un",
                ShowInPOS = true,
                CanBeUsedAsIngredient = true,
                ColorTag = "#EF4444",
                MinStockAlert = 8
            };

            var storeCocaPack = new Product
            {
                Id = "store-coca-pack6",
                Code = "TND-003",
                Name = "Paquete de 6 Sodas Coca-Cola 500ml",
                Category = ProductCategory.ARTICULO_TIENDA,
                Price = 38.00m,
                CostPrice = 27.00m,
                Stock = 5m,
                Unit = "paquete",
                ShowInPOS = true,
                CanBeUsedAsIngredient = false,
                ColorTag = "#B91C1C",
                UnpackTargetId = "store-coca-individual",
                UnpackUnitsYield = 6,
                MinStockAlert = 2
            };

            context.Products.AddRange(storeOreo, storeCoca, storeCocaPack);
            context.SaveChanges();

            // 5. SEED PRODUCTOS PREPARADOS CON RECETAS Y ESCANDALLO
            var prepSalchipapa = new Product
            {
                Id = "prep-salchipapa",
                Code = "PREP-001",
                Name = "Salchipapa Clásica Especial",
                Category = ProductCategory.PREPARADO,
                Price = 18.00m,
                CostPrice = 5.28m, // Calculado por receta
                Stock = 0, // Stock virtual
                Unit = "porcion",
                ShowInPOS = true,
                ColorTag = "#E11D48",
                Presentations = new List<ProductPresentation>
                {
                    new() { Name = "Porción Clásica", Multiplier = 1m, Price = 18.00m },
                    new() { Name = "Porción Doble / Familiar", Multiplier = 2m, Price = 32.00m }
                },
                RecipeItems = new List<RecipeItem>
                {
                    new() { IngredientProductId = rawPapa.Id, IngredientName = rawPapa.Name, Quantity = 250m, Unit = "g" },
                    new() { IngredientProductId = rawSalchicha.Id, IngredientName = rawSalchicha.Name, Quantity = 150m, Unit = "g" },
                    new() { IngredientProductId = rawAceite.Id, IngredientName = rawAceite.Name, Quantity = 50m, Unit = "ml" }
                }
            };

            var prepAsadito = new Product
            {
                Id = "prep-asadito-plato",
                Code = "PREP-002",
                Name = "Asadito al Plato con Yuca Cocida",
                Category = ProductCategory.PREPARADO,
                Price = 16.00m,
                CostPrice = 5.45m,
                Stock = 0,
                Unit = "porcion",
                ShowInPOS = true,
                ColorTag = "#B45309",
                RecipeItems = new List<RecipeItem>
                {
                    new() { IngredientProductId = frzAsadito.Id, IngredientName = frzAsadito.Name, Quantity = 1m, Unit = "un" },
                    new() { IngredientProductId = rawYuca.Id, IngredientName = rawYuca.Name, Quantity = 250m, Unit = "g" },
                    new() { IngredientProductId = rawAceite.Id, IngredientName = rawAceite.Name, Quantity = 40m, Unit = "ml" }
                }
            };

            var prepMalteada = new Product
            {
                Id = "prep-malteada-oreo",
                Code = "PREP-003",
                Name = "Malteada Artesanal de Oreo",
                Category = ProductCategory.PREPARADO,
                Price = 15.00m,
                CostPrice = 5.20m,
                Stock = 0,
                Unit = "porcion",
                ShowInPOS = true,
                ColorTag = "#475569",
                RecipeItems = new List<RecipeItem>
                {
                    new() { IngredientProductId = storeOreo.Id, IngredientName = storeOreo.Name, Quantity = 2m, Unit = "un" }
                }
            };

            context.Products.AddRange(prepSalchipapa, prepAsadito, prepMalteada);
            context.SaveChanges();

            // 6. SEED CASH SESSION
            var initialSession = new CashSession
            {
                Id = "cs-2026-10-21-01",
                OpenedAt = DateTime.UtcNow.AddHours(-4),
                OpenedBy = "Cajero Turno Mañana",
                InitialCash = 350.00m,
                IsOpen = true,
                CashSales = 540.00m,
                DebtRepaymentsInCash = 120.00m,
                CashExpenses = 45.00m,
                GenericPurchasesInCash = 80.00m
            };
            context.CashSessions.Add(initialSession);

            // 7. SEED CLIENTS & DEBT
            var clientDonCarlos = new Client
            {
                Id = "cli-001",
                Name = "Don Carlos Méndez",
                Phone = "70123456",
                CreditLimit = 800m,
                CurrentDebt = 145.00m,
                WalletBalance = 0,
                OldestDebtDate = DateTime.UtcNow.AddDays(-6)
            };

            var clientDonaElena = new Client
            {
                Id = "cli-002",
                Name = "Doña Elena Choque",
                Phone = "71987654",
                CreditLimit = 500m,
                CurrentDebt = 0,
                WalletBalance = 75.00m // Saldo a favor en monedero
            };

            context.Clients.AddRange(clientDonCarlos, clientDonaElena);

            // 8. SEED FORENSIC AUDIT LOG
            var auditSeed = new AuditLog
            {
                Id = "aud-001",
                Timestamp = DateTime.UtcNow.AddHours(-5),
                UserName = "Miriam Suárez",
                Action = AuditAction.APERTURA_CAJA,
                TargetItem = "Caja Principal Mostrador",
                Details = "Apertura de turno de caja con fondo inicial de Bs. 350.00.",
                NewValue = "Bs. 350.00",
                Reason = "Inicio de jornada comercial"
            };
            context.AuditLogs.Add(auditSeed);

            context.SaveChanges();
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
