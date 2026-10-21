using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;
using Microsoft.EntityFrameworkCore;
using TiendaMiriam.Core.Entities;
using TiendaMiriam.Core.Enums;
using TiendaMiriam.Core.Services;
using TiendaMiriam.Infrastructure.Data;
using TiendaMiriam.POS.Services;

namespace TiendaMiriam.POS.Forms
{
    public partial class MainPosForm : Form
    {
        private readonly DbContextOptions<TiendaMiriamDbContext> _dbOptions;
        private readonly IUnitConversionService _conversionService;
        private readonly IRecipeEngine _recipeEngine;
        private readonly PosCartManager _cartManager;

        private List<Product> _catalog = new();
        private string _activeCategory = "ALL";
        private bool _seniorMode = true;

        public MainPosForm(
            DbContextOptions<TiendaMiriamDbContext> dbOptions,
            IUnitConversionService conversionService,
            IRecipeEngine recipeEngine)
        {
            _dbOptions = dbOptions;
            _conversionService = conversionService;
            _recipeEngine = recipeEngine;
            _cartManager = new PosCartManager(recipeEngine);

            InitializeComponent();
            ApplyStyling();
            LoadCatalogFromDatabase();
            RefreshCartGrid();
        }

        private void LoadCatalogFromDatabase()
        {
            using var db = new TiendaMiriamDbContext(_dbOptions);
            _catalog = db.Products
                .Include(p => p.Presentations)
                .Include(p => p.RecipeItems)
                .Where(p => p.ShowInPOS) // CRITICAL: Only direct sale products visible to cashier
                .OrderBy(p => p.Name)
                .ToList();

            RenderProductCards();
        }

        private void RenderProductCards()
        {
            flowCatalogPanel.Controls.Clear();

            var search = txtSearch.Text.Trim().ToLowerInvariant();
            var filtered = _catalog.Where(p =>
            {
                var matchesSearch = string.IsNullOrEmpty(search) ||
                                    p.Name.ToLowerInvariant().Contains(search) ||
                                    p.Code.ToLowerInvariant().Contains(search);

                var matchesCat = _activeCategory == "ALL" || p.Category.ToString() == _activeCategory;
                return matchesSearch && matchesCat;
            });

            foreach (var prod in filtered)
            {
                var card = CreateProductCard(prod);
                flowCatalogPanel.Controls.Add(card);
            }
        }

        private Panel CreateProductCard(Product p)
        {
            var card = new Panel
            {
                Width = _seniorMode ? 190 : 160,
                Height = _seniorMode ? 140 : 120,
                Margin = new Padding(8),
                BackColor = Color.FromArgb(30, 41, 59), // slate-800
                Cursor = Cursors.Hand
            };

            // Top Color Strip
            var colorStrip = new Panel
            {
                Dock = DockStyle.Top,
                Height = 6,
                BackColor = ColorTranslator.FromHtml(p.ColorTag ?? "#2563EB")
            };
            card.Controls.Add(colorStrip);

            // Product Name
            var lblName = new Label
            {
                Text = p.Name,
                Font = new Font("Segoe UI", _seniorMode ? 10.5f : 9.5f, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(10, 14),
                Size = new Size(card.Width - 20, 40)
            };
            card.Controls.Add(lblName);

            // Stock badge (allowing negative red numbers if -1, -2, -3)
            var lblStock = new Label
            {
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                Location = new Point(10, 60),
                AutoSize = true
            };

            if (p.Category == ProductCategory.PREPARADO)
            {
                var virtualStock = _recipeEngine.CalculateVirtualStock(p, _catalog);
                lblStock.Text = $"Virtual: {virtualStock} porc.";
                lblStock.ForeColor = Color.FromArgb(56, 189, 248); // sky-400
            }
            else if (p.Stock < 0)
            {
                lblStock.Text = $"{p.Stock} {p.Unit} (DÉFICIT)";
                lblStock.ForeColor = Color.FromArgb(244, 63, 94); // red-500
            }
            else
            {
                lblStock.Text = $"Stock: {p.Stock} {p.Unit}";
                lblStock.ForeColor = (p.Stock <= p.MinStockAlert) ? Color.FromArgb(251, 191, 36) : Color.FromArgb(148, 163, 184);
            }
            card.Controls.Add(lblStock);

            // Price badge
            var lblPrice = new Label
            {
                Text = $"Bs. {p.Price:F2}",
                Font = new Font("Segoe UI", _seniorMode ? 12f : 11f, FontStyle.Bold),
                ForeColor = Color.FromArgb(52, 211, 153), // emerald-400
                Location = new Point(10, 85),
                AutoSize = true
            };
            card.Controls.Add(lblPrice);

            // Click event to add item to cart
            void OnCardClick(object? sender, EventArgs e)
            {
                if (p.Presentations != null && p.Presentations.Any())
                {
                    // Prompt for presentation or default to unit
                    _cartManager.AddItem(p, 1, p.Presentations.First());
                }
                else
                {
                    _cartManager.AddItem(p, 1);
                }
                RefreshCartGrid();
            }

            card.Click += OnCardClick;
            lblName.Click += OnCardClick;
            lblPrice.Click += OnCardClick;
            lblStock.Click += OnCardClick;

            return card;
        }

        private void RefreshCartGrid()
        {
            gridCart.Rows.Clear();
            foreach (var item in _cartManager.Items)
            {
                gridCart.Rows.Add(
                    item.Product.Name + (!string.IsNullOrEmpty(item.PresentationName) ? $" ({item.PresentationName})" : ""),
                    item.Quantity,
                    $"Bs. {item.UnitPrice:F2}",
                    $"Bs. {item.Total:F2}"
                );
            }

            lblSubtotal.Text = $"Bs. {_cartManager.Subtotal:F2}";
            lblTotal.Text = $"Bs. {_cartManager.Total:F2}";
            btnCharge.Text = $"COBRAR (F1) • Bs. {_cartManager.Total:F2}";
        }

        private void BtnCharge_Click(object? sender, EventArgs e)
        {
            if (!_cartManager.Items.Any())
            {
                MessageBox.Show("El carrito de venta está vacío.", "Atención", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Quick cash payment simulation
            var receiptNum = $"TM-{DateTime.UtcNow.Ticks.ToString().Substring(12)}";
            var sale = _cartManager.BuildSale(receiptNum, PaymentMethod.EFECTIVO, _cartManager.Total, "Cajero Turno");

            using (var db = new TiendaMiriamDbContext(_dbOptions))
            {
                var catalogDict = db.Products
                    .Include(p => p.RecipeItems)
                    .Include(p => p.Presentations)
                    .ToDictionary(p => p.Id);

                // Atomic deduction in local SQLite (Offline-First)
                _recipeEngine.DeductInventoryForSale(sale, catalogDict);
                db.Sales.Add(sale);
                db.SaveChanges();
            }

            MessageBox.Show(
                $"¡Venta {receiptNum} cobrada con éxito!\nTotal: Bs. {sale.Total:F2}\nInventario e insumos deducidos atómicamente de SQLite.",
                "Cobro Exitoso",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );

            _cartManager.Clear();
            RefreshCartGrid();
            LoadCatalogFromDatabase();
        }

        private void TxtSearch_TextChanged(object? sender, EventArgs e)
        {
            RenderProductCards();
        }

        private void BtnClear_Click(object? sender, EventArgs e)
        {
            _cartManager.Clear();
            RefreshCartGrid();
        }

        private void BtnSeniorToggle_Click(object? sender, EventArgs e)
        {
            _seniorMode = !_seniorMode;
            btnSeniorToggle.Text = _seniorMode ? "Modo Senior: ON" : "Modo Senior: OFF";
            RenderProductCards();
        }

        private void ApplyStyling()
        {
            this.BackColor = Color.FromArgb(15, 23, 42); // slate-900
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 10f);
            this.WindowState = FormWindowState.Maximized;
        }
    }
}
