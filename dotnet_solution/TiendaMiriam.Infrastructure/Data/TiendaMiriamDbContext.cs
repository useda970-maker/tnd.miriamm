using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Entities;

namespace TiendaMiriam.Infrastructure.Data
{
    public class TiendaMiriamDbContext : DbContext
    {
        public TiendaMiriamDbContext(DbContextOptions<TiendaMiriamDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductPresentation> ProductPresentations => Set<ProductPresentation>();
        public DbSet<RecipeItem> RecipeItems => Set<RecipeItem>();
        public DbSet<Sale> Sales => Set<Sale>();
        public DbSet<SaleItem> SaleItems => Set<SaleItem>();
        public DbSet<CashSession> CashSessions => Set<CashSession>();
        public DbSet<CashClosing> CashClosings => Set<CashClosing>();
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
                entity.Property(e => e.FullName).HasMaxLength(100).IsRequired();
            });

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.Code).HasMaxLength(30).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
                entity.Property(e => e.Price).HasPrecision(18, 2);
                entity.Property(e => e.CostPrice).HasPrecision(18, 4);
                entity.Property(e => e.Stock).HasPrecision(18, 4);
                entity.Property(e => e.Unit).HasMaxLength(20).IsRequired();
            });

            // Product Presentation configuration
            modelBuilder.Entity<ProductPresentation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Presentations)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Recipe Item configuration
            modelBuilder.Entity<RecipeItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ParentProduct)
                      .WithMany(p => p.RecipeItems)
                      .HasForeignKey(e => e.ParentProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.IngredientProduct)
                      .WithMany()
                      .HasForeignKey(e => e.IngredientProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Sale configuration
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ReceiptNumber).IsUnique();
                entity.Property(e => e.ReceiptNumber).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Total).HasPrecision(18, 2);
            });

            // Sale Item configuration
            modelBuilder.Entity<SaleItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Sale)
                      .WithMany(s => s.Items)
                      .HasForeignKey(e => e.SaleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Cash Session configuration
            modelBuilder.Entity<CashSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.InitialCash).HasPrecision(18, 2);
            });

            // Audit Log configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Timestamp);
                entity.Property(e => e.UserName).HasMaxLength(100);
            });
        }
    }
}
