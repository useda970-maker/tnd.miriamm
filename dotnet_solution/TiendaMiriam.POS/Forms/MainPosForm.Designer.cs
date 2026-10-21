namespace TiendaMiriam.POS.Forms
{
    partial class MainPosForm
    {
        private System.ComponentModel.IContainer components = null;

        private System.Windows.Forms.Panel panelSidebar;
        private System.Windows.Forms.Panel panelCatalog;
        private System.Windows.Forms.Panel panelCart;

        // Sidebar elements
        private System.Windows.Forms.Label lblLogo;
        private System.Windows.Forms.Label lblCashierInfo;
        private System.Windows.Forms.Button btnSeniorToggle;
        private System.Windows.Forms.Button btnTables;
        private System.Windows.Forms.Button btnHoldOrders;
        private System.Windows.Forms.Button btnCashSession;

        // Catalog elements
        private System.Windows.Forms.Panel panelSearchHeader;
        private System.Windows.Forms.TextBox txtSearch;
        private System.Windows.Forms.FlowLayoutPanel flowCatalogPanel;

        // Cart elements
        private System.Windows.Forms.DataGridView gridCart;
        private System.Windows.Forms.Label lblCartTitle;
        private System.Windows.Forms.Panel panelTotals;
        private System.Windows.Forms.Label lblSubtotalTitle;
        private System.Windows.Forms.Label lblSubtotal;
        private System.Windows.Forms.Label lblTotalTitle;
        private System.Windows.Forms.Label lblTotal;
        private System.Windows.Forms.Button btnCharge;
        private System.Windows.Forms.Button btnClearCart;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.panelSidebar = new System.Windows.Forms.Panel();
            this.lblLogo = new System.Windows.Forms.Label();
            this.lblCashierInfo = new System.Windows.Forms.Label();
            this.btnSeniorToggle = new System.Windows.Forms.Button();
            this.btnTables = new System.Windows.Forms.Button();
            this.btnHoldOrders = new System.Windows.Forms.Button();
            this.btnCashSession = new System.Windows.Forms.Button();

            this.panelCatalog = new System.Windows.Forms.Panel();
            this.panelSearchHeader = new System.Windows.Forms.Panel();
            this.txtSearch = new System.Windows.Forms.TextBox();
            this.flowCatalogPanel = new System.Windows.Forms.FlowLayoutPanel();

            this.panelCart = new System.Windows.Forms.Panel();
            this.lblCartTitle = new System.Windows.Forms.Label();
            this.gridCart = new System.Windows.Forms.DataGridView();
            this.panelTotals = new System.Windows.Forms.Panel();
            this.lblSubtotalTitle = new System.Windows.Forms.Label();
            this.lblSubtotal = new System.Windows.Forms.Label();
            this.lblTotalTitle = new System.Windows.Forms.Label();
            this.lblTotal = new System.Windows.Forms.Label();
            this.btnCharge = new System.Windows.Forms.Button();
            this.btnClearCart = new System.Windows.Forms.Button();

            //
            // Form
            //
            this.Text = "Tienda Miriam - Punto de Venta (POS Offline-First SQLite)";
            this.Size = new System.Drawing.Size(1280, 800);
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;

            //
            // panelSidebar (Column 1: 220px)
            //
            this.panelSidebar.Dock = System.Windows.Forms.DockStyle.Left;
            this.panelSidebar.Width = 220;
            this.panelSidebar.BackColor = System.Drawing.Color.FromArgb(15, 23, 42); // slate-900
            this.panelSidebar.Padding = new System.Windows.Forms.Padding(12);

            this.lblLogo.Text = "TIENDA MIRIAM\nPOS OFFLINE";
            this.lblLogo.Font = new System.Drawing.Font("Segoe UI", 12f, System.Drawing.FontStyle.Bold);
            this.lblLogo.ForeColor = System.Drawing.Color.FromArgb(52, 211, 153);
            this.lblLogo.Location = new System.Drawing.Point(12, 16);
            this.lblLogo.Size = new System.Drawing.Size(196, 48);

            this.lblCashierInfo.Text = "Cajero: Turno Mañana\nModo: SQLite Local (100% Offline)";
            this.lblCashierInfo.Font = new System.Drawing.Font("Segoe UI", 8.5f);
            this.lblCashierInfo.ForeColor = System.Drawing.Color.FromArgb(148, 163, 184);
            this.lblCashierInfo.Location = new System.Drawing.Point(12, 70);
            this.lblCashierInfo.Size = new System.Drawing.Size(196, 40);

            this.btnTables.Text = "🍽️ Mesas Restaurante";
            this.btnTables.Location = new System.Drawing.Point(12, 130);
            this.btnTables.Size = new System.Drawing.Size(196, 44);
            this.btnTables.BackColor = System.Drawing.Color.FromArgb(30, 41, 59);
            this.btnTables.ForeColor = System.Drawing.Color.White;
            this.btnTables.FlatStyle = System.Windows.Forms.FlatStyle.Flat;

            this.btnHoldOrders.Text = "⏱️ En Espera (F9)";
            this.btnHoldOrders.Location = new System.Drawing.Point(12, 182);
            this.btnHoldOrders.Size = new System.Drawing.Size(196, 44);
            this.btnHoldOrders.BackColor = System.Drawing.Color.FromArgb(30, 41, 59);
            this.btnHoldOrders.ForeColor = System.Drawing.Color.White;
            this.btnHoldOrders.FlatStyle = System.Windows.Forms.FlatStyle.Flat;

            this.btnCashSession.Text = "💵 Arqueo de Turno";
            this.btnCashSession.Location = new System.Drawing.Point(12, 234);
            this.btnCashSession.Size = new System.Drawing.Size(196, 44);
            this.btnCashSession.BackColor = System.Drawing.Color.FromArgb(30, 41, 59);
            this.btnCashSession.ForeColor = System.Drawing.Color.White;
            this.btnCashSession.FlatStyle = System.Windows.Forms.FlatStyle.Flat;

            this.btnSeniorToggle.Text = "Modo Senior: ON";
            this.btnSeniorToggle.Location = new System.Drawing.Point(12, 286);
            this.btnSeniorToggle.Size = new System.Drawing.Size(196, 44);
            this.btnSeniorToggle.BackColor = System.Drawing.Color.FromArgb(217, 119, 6);
            this.btnSeniorToggle.ForeColor = System.Drawing.Color.White;
            this.btnSeniorToggle.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSeniorToggle.Click += new System.EventHandler(this.BtnSeniorToggle_Click);

            this.panelSidebar.Controls.Add(this.lblLogo);
            this.panelSidebar.Controls.Add(this.lblCashierInfo);
            this.panelSidebar.Controls.Add(this.btnTables);
            this.panelSidebar.Controls.Add(this.btnHoldOrders);
            this.panelSidebar.Controls.Add(this.btnCashSession);
            this.panelSidebar.Controls.Add(this.btnSeniorToggle);

            //
            // panelCart (Column 3: 380px)
            //
            this.panelCart.Dock = System.Windows.Forms.DockStyle.Right;
            this.panelCart.Width = 380;
            this.panelCart.BackColor = System.Drawing.Color.FromArgb(15, 23, 42); // slate-900
            this.panelCart.Padding = new System.Windows.Forms.Padding(12);

            this.lblCartTitle.Text = "CARRITO DE COBRO";
            this.lblCartTitle.Dock = System.Windows.Forms.DockStyle.Top;
            this.lblCartTitle.Height = 35;
            this.lblCartTitle.Font = new System.Drawing.Font("Segoe UI", 12f, System.Drawing.FontStyle.Bold);
            this.lblCartTitle.ForeColor = System.Drawing.Color.White;

            this.gridCart.Dock = System.Windows.Forms.DockStyle.Fill;
            this.gridCart.BackgroundColor = System.Drawing.Color.FromArgb(30, 41, 59);
            this.gridCart.ForeColor = System.Drawing.Color.Black;
            this.gridCart.ColumnCount = 4;
            this.gridCart.Columns[0].Name = "Producto";
            this.gridCart.Columns[0].Width = 160;
            this.gridCart.Columns[1].Name = "Cant";
            this.gridCart.Columns[1].Width = 45;
            this.gridCart.Columns[2].Name = "P.Unit";
            this.gridCart.Columns[2].Width = 65;
            this.gridCart.Columns[3].Name = "Total";
            this.gridCart.Columns[3].Width = 70;
            this.gridCart.AllowUserToAddRows = false;
            this.gridCart.RowHeadersVisible = false;

            this.panelTotals.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.panelTotals.Height = 180;
            this.panelTotals.BackColor = System.Drawing.Color.FromArgb(2, 6, 23); // slate-950
            this.panelTotals.Padding = new System.Windows.Forms.Padding(12);

            this.lblSubtotalTitle.Text = "Subtotal:";
            this.lblSubtotalTitle.Location = new System.Drawing.Point(12, 12);
            this.lblSubtotalTitle.ForeColor = System.Drawing.Color.FromArgb(148, 163, 184);

            this.lblSubtotal.Text = "Bs. 0.00";
            this.lblSubtotal.Location = new System.Drawing.Point(240, 12);
            this.lblSubtotal.ForeColor = System.Drawing.Color.White;
            this.lblSubtotal.TextAlign = System.Drawing.ContentAlignment.MiddleRight;

            this.lblTotalTitle.Text = "TOTAL A COBRAR:";
            this.lblTotalTitle.Font = new System.Drawing.Font("Segoe UI", 11f, System.Drawing.FontStyle.Bold);
            this.lblTotalTitle.Location = new System.Drawing.Point(12, 35);
            this.lblTotalTitle.ForeColor = System.Drawing.Color.FromArgb(52, 211, 153);

            this.lblTotal.Text = "Bs. 0.00";
            this.lblTotal.Font = new System.Drawing.Font("Segoe UI", 14f, System.Drawing.FontStyle.Bold);
            this.lblTotal.Location = new System.Drawing.Point(180, 32);
            this.lblTotal.Size = new System.Drawing.Size(180, 30);
            this.lblTotal.ForeColor = System.Drawing.Color.FromArgb(52, 211, 153);
            this.lblTotal.TextAlign = System.Drawing.ContentAlignment.MiddleRight;

            this.btnCharge.Text = "COBRAR (F1) • Bs. 0.00";
            this.btnCharge.Location = new System.Drawing.Point(12, 75);
            this.btnCharge.Size = new System.Drawing.Size(350, 52);
            this.btnCharge.BackColor = System.Drawing.Color.FromArgb(16, 185, 129); // emerald-500
            this.btnCharge.ForeColor = System.Drawing.Color.White;
            this.btnCharge.Font = new System.Drawing.Font("Segoe UI", 12f, System.Drawing.FontStyle.Bold);
            this.btnCharge.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnCharge.Click += new System.EventHandler(this.BtnCharge_Click);

            this.btnClearCart.Text = "Vaciar Carrito";
            this.btnClearCart.Location = new System.Drawing.Point(12, 134);
            this.btnClearCart.Size = new System.Drawing.Size(350, 32);
            this.btnClearCart.BackColor = System.Drawing.Color.FromArgb(30, 41, 59);
            this.btnClearCart.ForeColor = System.Drawing.Color.FromArgb(248, 113, 113);
            this.btnClearCart.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnClearCart.Click += new System.EventHandler(this.BtnClear_Click);

            this.panelTotals.Controls.Add(this.lblSubtotalTitle);
            this.panelTotals.Controls.Add(this.lblSubtotal);
            this.panelTotals.Controls.Add(this.lblTotalTitle);
            this.panelTotals.Controls.Add(this.lblTotal);
            this.panelTotals.Controls.Add(this.btnCharge);
            this.panelTotals.Controls.Add(this.btnClearCart);

            this.panelCart.Controls.Add(this.gridCart);
            this.panelCart.Controls.Add(this.this.panelTotals);
            this.panelCart.Controls.Add(this.lblCartTitle);

            //
            // panelCatalog (Column 2: Fill)
            //
            this.panelCatalog.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panelCatalog.BackColor = System.Drawing.Color.FromArgb(2, 6, 23); // slate-950

            this.panelSearchHeader.Dock = System.Windows.Forms.DockStyle.Top;
            this.panelSearchHeader.Height = 55;
            this.panelSearchHeader.Padding = new System.Windows.Forms.Padding(12);

            this.txtSearch.Dock = System.Windows.Forms.DockStyle.Fill;
            this.txtSearch.Font = new System.Drawing.Font("Segoe UI", 11f);
            this.txtSearch.PlaceholderText = "🔍 Buscar por nombre o escanear código de barras...";
            this.txtSearch.TextChanged += new System.EventHandler(this.TxtSearch_TextChanged);

            this.panelSearchHeader.Controls.Add(this.txtSearch);

            this.flowCatalogPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowCatalogPanel.AutoScroll = true;
            this.flowCatalogPanel.Padding = new System.Windows.Forms.Padding(10);

            this.panelCatalog.Controls.Add(this.flowCatalogPanel);
            this.panelCatalog.Controls.Add(this.panelSearchHeader);

            //
            // Form Controls
            //
            this.Controls.Add(this.panelCatalog);
            this.Controls.Add(this.panelCart);
            this.Controls.Add(this.panelSidebar);
        }
    }
}
