using System;
using System.Windows.Forms;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Services;
using TiendaMiriam.Infrastructure.Data;
using TiendaMiriam.POS.Forms;

namespace TiendaMiriam.POS
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            ApplicationConfiguration.Initialize();

            // 1. Initialize local SQLite Database (tiendamiram.db)
            var optionsBuilder = new DbContextOptionsBuilder<TiendaMiriamDbContext>();
            optionsBuilder.UseSqlite("Data Source=tiendamiram.db;");

            using (var dbContext = new TiendaMiriamDbContext(optionsBuilder.Options))
            {
                DbInitializer.Initialize(dbContext);
            }

            // 2. Setup domain services
            var conversionService = new UnitConversionService();
            var recipeEngine = new RecipeEngine(conversionService);

            // 3. Launch Main POS Form (100% Offline-First)
            Application.Run(new MainPosForm(optionsBuilder.Options, conversionService, recipeEngine));
        }
    }
}
