import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  DollarSign,
  Boxes,
  ShieldAlert,
  Percent,
  Plus,
  Edit3,
  Trash2,
  ChefHat,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BarChart2,
  Lock,
  PackagePlus,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { Product, ProductCategory, RecipeIngredient, ProductPresentation } from '../../types';
import { SYSTEM_UNITS, calculateIngredientCost, normalizeUnitCode } from '../../utils/unitConversion';
import { RecetaEditor } from './RecetaEditor';

export const OwnerDashboardView: React.FC = () => {
  const {
    products,
    sales,
    cashSession,
    cashClosings,
    auditLogs,
    currentUserRole,
    switchUserRole,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductRecipe,
    darkMode,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'kpis' | 'productos' | 'cajas' | 'auditoria'>('kpis');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [posFilter, setPosFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState<Product | null>(null);

  // Product Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: ProductCategory;
    price: number;
    costPrice: number;
    stock: number;
    unit: string;
    showInPOS: boolean;
    canBeUsedAsIngredient: boolean;
    minStockAlert: number;
    colorTag: string;
    batchNumber: string;
    expirationDate: string;
    isSoldByWeight: boolean;
    auditReason: string;
    presentations: ProductPresentation[];
  }>({
    code: '',
    name: '',
    category: 'ARTICULO_TIENDA',
    price: 0,
    costPrice: 0,
    stock: 0,
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    minStockAlert: 5,
    colorTag: '#2563EB',
    batchNumber: '',
    expirationDate: '',
    isSoldByWeight: false,
    auditReason: '',
    presentations: [],
  });

  // Access Control verification
  const isOwner = currentUserRole === 'DUEÑO';

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalSalesAmount = sales.reduce((acc, s) => (s.status === 'COMPLETADA' ? acc + s.total : acc), 0);
    const totalSalesCount = sales.filter(s => s.status === 'COMPLETADA').length;

    // Calculate COGS (Costo de Mercancía Vendida)
    let totalCOGS = 0;
    for (const sale of sales) {
      if (sale.status !== 'COMPLETADA') continue;
      for (const item of sale.items) {
        totalCOGS += (item.product.costPrice || 0) * item.quantity;
      }
    }

    const grossProfit = Math.max(0, totalSalesAmount - totalCOGS);
    const grossMarginPercent = totalSalesAmount > 0 ? (grossProfit / totalSalesAmount) * 100 : 0;

    // Discrepancy in cash closings
    const totalCashDiscrepancy = cashClosings.reduce((acc, c) => acc + (c.difference || 0), 0);

    return {
      totalSalesAmount,
      totalSalesCount,
      totalCOGS,
      grossProfit,
      grossMarginPercent,
      totalCashDiscrepancy,
    };
  }, [sales, cashClosings]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesPos =
        posFilter === 'ALL' ||
        (posFilter === 'YES' && p.showInPOS) ||
        (posFilter === 'NO' && !p.showInPOS);
      return matchesSearch && matchesCat && matchesPos;
    });
  }, [products, searchTerm, selectedCategory, posFilter]);

  // Open Create Product Modal
  const handleOpenCreateModal = () => {
    const randomCode = `PRD-${Math.floor(100 + Math.random() * 900)}`;
    setEditingProduct(null);
    setFormData({
      code: randomCode,
      name: '',
      category: 'ARTICULO_TIENDA',
      price: 10,
      costPrice: 5,
      stock: 10,
      unit: 'un',
      showInPOS: true,
      canBeUsedAsIngredient: false,
      minStockAlert: 5,
      colorTag: '#2563EB',
      batchNumber: '',
      expirationDate: '',
      isSoldByWeight: false,
      auditReason: 'Nuevo producto registrado por Dueño',
      presentations: [],
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      category: p.category,
      price: p.price,
      costPrice: p.costPrice,
      stock: p.stock,
      unit: p.unit,
      showInPOS: p.showInPOS,
      canBeUsedAsIngredient: p.canBeUsedAsIngredient,
      minStockAlert: p.minStockAlert || 5,
      colorTag: p.colorTag || '#2563EB',
      batchNumber: p.batchNumber || '',
      expirationDate: p.expirationDate || '',
      isSoldByWeight: p.isSoldByWeight || false,
      auditReason: '',
      presentations: p.presentations ? [...p.presentations] : [],
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('El nombre del producto es obligatorio.');
      return;
    }

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        code: formData.code,
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        unit: formData.unit,
        showInPOS: formData.showInPOS,
        canBeUsedAsIngredient: formData.canBeUsedAsIngredient,
        minStockAlert: Number(formData.minStockAlert),
        colorTag: formData.colorTag,
        batchNumber: formData.batchNumber,
        expirationDate: formData.expirationDate,
        isSoldByWeight: formData.isSoldByWeight,
        presentations: formData.presentations,
      };
      updateProduct(updated, formData.auditReason || 'Ajuste desde Panel Web Empresarial');
    } else {
      // Create
      createProduct(
        {
          code: formData.code,
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          costPrice: Number(formData.costPrice),
          stock: Number(formData.stock),
          unit: formData.unit,
          showInPOS: formData.showInPOS,
          canBeUsedAsIngredient: formData.canBeUsedAsIngredient,
          minStockAlert: Number(formData.minStockAlert),
          colorTag: formData.colorTag,
          batchNumber: formData.batchNumber,
          expirationDate: formData.expirationDate,
          isSoldByWeight: formData.isSoldByWeight,
          presentations: formData.presentations,
        },
        formData.auditReason || 'Alta de producto por el Dueño'
      );
    }
    setIsProductModalOpen(false);
  };

  // Open Recipe Editor Modal (RecetaEditor component)
  const handleOpenRecipeModal = (p: Product) => {
    setRecipeProduct(p);
    setIsRecipeModalOpen(true);
  };

  // Delete product with confirmation
  const handleDeleteProduct = (p: Product) => {
    const confirm = window.confirm(
      `¿Está seguro de eliminar el producto "${p.name}"? Esta acción se registrará en la auditoría forense.`
    );
    if (!confirm) return;

    const result = deleteProduct(p.id, 'Eliminación manual desde Panel Web del Dueño');
    if (!result.success) {
      alert(result.message);
    }
  };

  // If cashier tries to view this, show lock screen with PIN unlock option
  if (!isOwner) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-900 text-slate-100">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Exclusivo del Dueño</h2>
          <p className="text-sm text-slate-400 mb-6">
            El perfil actual (<strong className="text-amber-400">CAJERO</strong>) no cuenta con permisos
            para acceder al Panel Web Empresarial, modificar recetas, costos o catálogo maestro.
          </p>

          <button
            onClick={() => {
              const pin = window.prompt('Ingrese el PIN de Dueña / Administrador (Predeterminado: 1234):');
              if (pin) {
                const res = switchUserRole('DUEÑO', pin);
                if (!res.success) {
                  alert(res.message);
                }
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>Desbloquear como Dueño (PIN)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Corporate Executive Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-xl shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Panel Web Empresarial
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PRO • MODO DUEÑO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Control Maestro de Costos, Escandallo, Existencias y Auditoría Forense
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto / Insumo</span>
          </button>

          <button
            onClick={() => switchUserRole('CAJERO')}
            title="Cambiar temporalmente al rol Cajero para probar restricciones"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Simular Rol Cajero</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('kpis')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'kpis'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Métricas Financieras & KPIs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('productos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'productos'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Catálogo Maestro & Recetas ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cajas')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'cajas'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Control de Cajas & Arqueos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('auditoria')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'auditoria'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Auditoría Forense ({auditLogs.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
        {/* TAB 1: METRICAS Y KPIS */}
        {activeSubTab === 'kpis' && (
          <div className="flex flex-col gap-6">
            {/* KPI 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Ventas Brutas */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ventas Brutas Totales
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  Bs. {metrics.totalSalesAmount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">
                    {metrics.totalSalesCount} transacciones
                  </span>
                  <span>en el periodo</span>
                </div>
              </div>

              {/* Card 2: Costo de Ventas COGS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Costo de Insumos (COGS)
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  Bs. {metrics.totalCOGS.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Materia prima y escandallo deducido
                </div>
              </div>

              {/* Card 3: Margen Bruto Real */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Margen Bruto Real
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {metrics.grossMarginPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-emerald-400 font-bold mt-1">
                  Ganancia Bruta: Bs. {metrics.grossProfit.toFixed(2)}
                </div>
              </div>

              {/* Card 4: Arqueo y Caja */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Efectivo en Caja Actual
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  Bs. {cashSession.expectedCash.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Estado:{' '}
                  <span
                    className={`font-bold ${
                      cashSession.isOpen ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {cashSession.isOpen ? 'Turno Abierto' : 'Cerrada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Analysis & Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution of payment methods */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Distribución de Cobranzas por Método de Pago</span>
                </h3>
                <div className="space-y-3">
                  {(['EFECTIVO', 'QR', 'FIADO', 'MONEDERO', 'PAGO_MIXTO'] as const).map(m => {
                    const totalForMethod = sales
                      .filter(s => s.status === 'COMPLETADA' && s.payment.method === m)
                      .reduce((acc, s) => acc + s.total, 0);
                    const pct = metrics.totalSalesAmount > 0
                      ? (totalForMethod / metrics.totalSalesAmount) * 100
                      : 0;

                    return (
                      <div key={m}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-300">{m}</span>
                          <span className="text-slate-100 font-mono">
                            Bs. {totalForMethod.toFixed(2)} ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              m === 'EFECTIVO'
                                ? 'bg-emerald-500'
                                : m === 'QR'
                                ? 'bg-cyan-500'
                                : m === 'FIADO'
                                ? 'bg-amber-500'
                                : 'bg-purple-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Productos con Mayor Rendimiento</span>
                </h3>
                <div className="space-y-3">
                  {products
                    .filter(p => p.category === 'PREPARADO' || p.category === 'ARTICULO_TIENDA')
                    .slice(0, 5)
                    .map(p => {
                      const unitProfit = Math.max(0, p.price - p.costPrice);
                      const marginPct = p.price > 0 ? (unitProfit / p.price) * 100 : 0;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{p.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Venta: Bs. {p.price.toFixed(2)} | Costo: Bs. {p.costPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              +{marginPct.toFixed(0)}% Margen
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTOS, RECETAS Y ESCANDALLO */}
        {activeSubTab === 'productos' && (
          <div className="flex flex-col gap-4">
            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre o código..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-hidden"
                >
                  <option value="ALL">Todas las Categorías</option>
                  <option value="INSUMO_CRUDO">Insumos Crudos (Materia Prima)</option>
                  <option value="PREPARADO">Productos Preparados (Recetas)</option>
                  <option value="CONGELADO_LOTE">Productos Congelados (Lotes)</option>
                  <option value="ARTICULO_TIENDA">Artículos de Tienda (Reventa)</option>
                  <option value="SERVICIO">Servicios</option>
                </select>

                {/* POS Visibility Filter */}
                <select
                  value={posFilter}
                  onChange={e => setPosFilter(e.target.value as 'ALL' | 'YES' | 'NO')}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-hidden"
                >
                  <option value="ALL">Todo Catálogo</option>
                  <option value="YES">Visible en POS (Venta Directa)</option>
                  <option value="NO">Oculto en POS (Solo Insumo Interno)</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Código / Producto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Unidad Base</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Costo Producción</th>
                      <th className="py-3 px-4">Precio Venta</th>
                      <th className="py-3 px-4 text-center">¿Venta Directa POS?</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.map(p => {
                      const isPrepared = p.category === 'PREPARADO';
                      const isRaw = p.category === 'INSUMO_CRUDO';
                      const margin = p.price > 0 ? ((p.price - p.costPrice) / p.price) * 100 : 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{p.name}</span>
                              {p.presentations && p.presentations.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {p.presentations.length} presentaciones
                                </span>
                              )}
                              {p.isSoldByWeight && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                  <Scale className="w-2.5 h-2.5" /> Peso
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{p.code}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isPrepared
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : isRaw
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                  : p.category === 'CONGELADO_LOTE'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {p.category}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-medium text-slate-300">
                            {p.unit}
                          </td>

                          <td className="py-3 px-4 font-mono">
                            {isPrepared ? (
                              <span className="text-cyan-400 font-semibold" title="Stock virtual calculado según insumos">
                                Virtual ({p.recipe?.length || 0} ing.)
                              </span>
                            ) : p.stock < 0 ? (
                              <span className="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                                {p.stock} {p.unit} (Déficit)
                              </span>
                            ) : (
                              <span
                                className={
                                  p.stock <= (p.minStockAlert || 5)
                                    ? 'text-amber-400 font-bold'
                                    : 'text-slate-200'
                                }
                              >
                                {p.stock} {p.unit}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            Bs. {p.costPrice.toFixed(2)}
                          </td>

                          <td className="py-3 px-4 font-mono">
                            {p.price > 0 ? (
                              <div className="font-bold text-emerald-400">
                                Bs. {p.price.toFixed(2)}
                                <span className="ml-1 text-[10px] text-slate-400 font-normal">
                                  ({margin.toFixed(0)}%)
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">No para venta</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {p.showInPOS ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Sí (En Caja)</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700"
                                title="Insumo interno oculto al cajero"
                              >
                                <XCircle className="w-3 h-3 text-slate-500" />
                                <span>No (Insumo Cocina)</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {(isPrepared || p.category === 'CONGELADO_LOTE') && (
                                <button
                                  onClick={() => handleOpenRecipeModal(p)}
                                  title="Editar Escandallo y Receta Libre"
                                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                                >
                                  <ChefHat className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditModal(p)}
                                title="Modificar Datos y Precios"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(p)}
                                title="Eliminar Producto"
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTROL DE CAJAS & ARQUEOS */}
        {activeSubTab === 'cajas' && (
          <div className="flex flex-col gap-6">
            {/* Active Cash Register State */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Estado del Turno de Caja en Tiempo Real</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400">Fondo Inicial de Apertura</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    Bs. {cashSession.initialCash.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Abierto por: {cashSession.openedBy}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400">Ventas en Efectivo del Turno</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    +Bs. {cashSession.cashSales.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Cobros directos en mostrador</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-xs text-slate-400">Salidas (Gastos + Compras Mercado)</div>
                  <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                    -Bs. {(cashSession.cashExpenses + cashSession.genericPurchasesInCash).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Egresos de caja chica</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-emerald-500/30">
                  <div className="text-xs text-slate-400">Efectivo Esperado en Gaveta</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    Bs. {cashSession.expectedCash.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {cashSession.isOpen ? 'Turno en Operación' : 'Caja Cerrada'}
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Closings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-white mb-4">
                Historial de Arqueos y Cuadres de Turno
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Cajero</th>
                      <th className="py-2.5 px-3">Esperado</th>
                      <th className="py-2.5 px-3">Contado Físico</th>
                      <th className="py-2.5 px-3">Diferencia</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cashClosings.map(c => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">{c.sessionCode}</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(c.closedAt).toLocaleString('es-BO')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{c.closedBy}</td>
                        <td className="py-2.5 px-3 font-mono">Bs. {c.expectedCash.toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">
                          Bs. {c.actualCashCounted.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {c.difference === 0 ? (
                            <span className="text-emerald-400 font-bold">Bs. 0.00</span>
                          ) : c.difference > 0 ? (
                            <span className="text-cyan-400 font-bold">+Bs. {c.difference.toFixed(2)} (Sobrante)</span>
                          ) : (
                            <span className="text-rose-400 font-bold">Bs. {c.difference.toFixed(2)} (Faltante)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'CUADRADA'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDITORIA FORENSE */}
        {activeSubTab === 'auditoria' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  <span>Bitácora de Auditoría Forense Empresarial</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Registro inalterable de cada modificación de precio, receta, stock o anulación.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3">Usuario Responsable</th>
                    <th className="py-2.5 px-3">Acción Crítica</th>
                    <th className="py-2.5 px-3">Ítem / Registro</th>
                    <th className="py-2.5 px-3">Detalles</th>
                    <th className="py-2.5 px-3">Valor Anterior</th>
                    <th className="py-2.5 px-3">Valor Nuevo</th>
                    <th className="py-2.5 px-3">Motivo / Justificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.slice(0, 50).map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('es-BO')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-300">{log.targetItem}</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {log.previousValue || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                        {log.newValue || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 italic">{log.reason || 'Sin motivo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREAR / EDITAR PRODUCTO */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-400" />
              <span>{editingProduct ? 'Editar Producto / Insumo' : 'Crear Nuevo Producto / Insumo'}</span>
            </h3>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Código de Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    placeholder="Ej. Galletas Oreo Original 108g"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoría Funcional
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                  >
                    <option value="ARTICULO_TIENDA">Artículo de Tienda (Reventa comercial)</option>
                    <option value="PREPARADO">Producto Preparado (Requiere Receta/Escandallo)</option>
                    <option value="CONGELADO_LOTE">Producto Congelado (Lote y Trazabilidad)</option>
                    <option value="INSUMO_CRUDO">Insumo Crudo (Materia Prima de Cocina)</option>
                    <option value="SERVICIO">Servicio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unidad de Medida Base (Libre)
                  </label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                  >
                    {SYSTEM_UNITS.map(u => (
                      <option key={u.code} value={u.code}>
                        {u.name} [{u.type}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Costo de Compra / Producción (Bs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Precio de Venta al Público (Bs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden font-mono text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Stock Inicial / Actual
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alerta de Stock Mínimo
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.minStockAlert}
                    onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* CRITICAL RESTRICTION FLAG */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="showInPosCheckbox"
                  checked={formData.showInPOS}
                  onChange={e => setFormData({ ...formData, showInPOS: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="showInPosCheckbox" className="text-xs cursor-pointer">
                  <span className="font-bold text-white block">
                    ¿Permitir venta directa al público en el POS?
                  </span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">
                    <strong>SÍ:</strong> El producto se muestra en el catálogo táctil de la caja para cobro directo.
                    <br />
                    <strong>NO:</strong> El producto actúa como <em>Insumo o Materia Prima interna</em>, ocultándose de la caja para evitar confusiones al cajero pero descontándose atómicamente en las recetas.
                  </span>
                </label>
              </div>

              {/* Multi-role flag */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="canBeUsedAsIngredientCheckbox"
                  checked={formData.canBeUsedAsIngredient}
                  onChange={e => setFormData({ ...formData, canBeUsedAsIngredient: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <label htmlFor="canBeUsedAsIngredientCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  <strong>Producto Multifunción (Doble Rol):</strong> Puede consumirse como ingrediente en recetas (ej. Coca-Cola para marinadas, Galleta Oreo en malteadas).
                </label>
              </div>

              {/* Frozen Batch & Traceability */}
              {formData.category === 'CONGELADO_LOTE' && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/50 flex flex-col gap-3">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    <span>Control de Trazabilidad de Congelados & Pesaje</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Número de Lote</label>
                      <input
                        type="text"
                        value={formData.batchNumber}
                        onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                        placeholder="LOT-2026-X"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Fecha de Caducidad</label>
                      <input
                        type="date"
                        value={formData.expirationDate}
                        onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="isSoldByWeightCheck"
                        checked={formData.isSoldByWeight}
                        onChange={e => setFormData({ ...formData, isSoldByWeight: e.target.checked })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <label htmlFor="isSoldByWeightCheck" className="text-xs text-purple-200">
                        Vendido por Peso (kg / lb)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Reason Field (Mandatory) */}
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">
                  Motivo / Justificación para la Auditoría Forense (Obligatorio)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ajuste de tarifa de proveedor, nuevo producto incorporado..."
                  value={formData.auditReason}
                  onChange={e => setFormData({ ...formData, auditReason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-amber-500/40 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPONENTE RECETA EDITOR (ESCANDALLO Y RECETA LIBRE) */}
      {isRecipeModalOpen && recipeProduct && (
        <RecetaEditor
          product={recipeProduct}
          onClose={() => {
            setIsRecipeModalOpen(false);
            setRecipeProduct(null);
          }}
          onSaved={() => {
            setIsRecipeModalOpen(false);
            setRecipeProduct(null);
          }}
        />
      )}
    </div>
  );
};
