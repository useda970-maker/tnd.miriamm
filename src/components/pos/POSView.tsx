import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, CartItem, Sale, PaymentBreakdown, ProductPresentation, HoldOrder } from '../../types';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { HoldOrdersModal } from './HoldOrdersModal';
import { PresentationModal } from './PresentationModal';
import { StockAlertsPanel } from './StockAlertsPanel';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  Store,
  Snowflake,
  Sparkles,
  HelpCircle,
  Tag,
  MessageSquare,
  Clock,
  CheckCircle2,
  PauseCircle,
  Layers,
  Barcode,
} from 'lucide-react';

interface POSViewProps {
  onGoToTables?: () => void;
  initialTableOrder?: { tableNumber: string; items: CartItem[] } | null;
  onClearInitialTableOrder?: () => void;
}

export const POSView: React.FC<POSViewProps> = ({
  onGoToTables,
  initialTableOrder,
  onClearInitialTableOrder,
}) => {
  const {
    products,
    tables,
    calculateVirtualStock,
    completeSale,
    saveOrderToTable,
    seniorMode,
    cashSession,
    shortcuts,
    holdOrders,
    deleteHoldOrder,
  } = useStore();

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>(initialTableOrder?.items || []);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(
    initialTableOrder?.tableNumber || ''
  );
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [editingItemNotesIndex, setEditingItemNotesIndex] = useState<number | null>(null);

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isHoldOrdersOpen, setIsHoldOrdersOpen] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [presentationProduct, setPresentationProduct] = useState<Product | null>(null);

  // Listen for global shortcut dispatches
  React.useEffect(() => {
    const handleShortcutAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string }>;
      const action = customEvent.detail?.action;

      if (action === 'QUICK_PAY') {
        if (cart.length > 0) {
          setIsPaymentOpen(true);
        } else {
          alert(`El carrito de venta está vacío. Toque productos del menú antes de cobrar con [${shortcuts.QUICK_PAY}].`);
        }
      } else if (action === 'FOCUS_SEARCH') {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (action === 'CLEAR_CART') {
        if (cart.length > 0) {
          if (confirm(`¿Vaciar todo el pedido en curso? [${shortcuts.CLEAR_CART}]`)) {
            setCart([]);
            setSelectedTableNumber('');
          }
        }
      } else if (action === 'HOLD_ORDERS') {
        setIsHoldOrdersOpen(true);
      }
    };

    window.addEventListener('pos-shortcut-action', handleShortcutAction);
    return () => {
      window.removeEventListener('pos-shortcut-action', handleShortcutAction);
    };
  }, [cart, shortcuts]);

  // Only products marked as showInPOS are visible to the cashier
  const visibleProducts = useMemo(() => {
    return products.filter(p => p.showInPOS);
  }, [products]);

  // Filtered products by category and search
  const filteredProducts = useMemo(() => {
    return visibleProducts.filter(p => {
      const matchesCategory =
        activeCategory === 'ALL' ||
        (activeCategory === 'PREPARADO' && p.category === 'PREPARADO') ||
        (activeCategory === 'CONGELADO' && p.category === 'CONGELADO_LOTE') ||
        (activeCategory === 'TIENDA' && p.category === 'ARTICULO_TIENDA') ||
        (activeCategory === 'SERVICIO' && p.category === 'SERVICIO');

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [visibleProducts, activeCategory, searchQuery]);

  // Handle adding product directly or triggering presentation modal
  const handleProductCardClick = (product: Product) => {
    if (product.presentations && product.presentations.length > 0) {
      setPresentationProduct(product);
    } else {
      addToCart(product);
    }
  };

  // Cart operations
  const addToCart = (
    product: Product,
    presentation?: ProductPresentation
  ) => {
    setCart(prev => {
      const presId = presentation?.id;
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.presentationId === presId
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            unitPrice: presentation ? presentation.price : product.price,
            presentationId: presentation?.id,
            presentationName: presentation?.name,
          },
        ];
      }
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      next[index] = { ...next[index], quantity: newQty };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemNotes = (index: number, note: string) => {
    setCart(prev => {
      const next = [...prev];
      next[index] = { ...next[index], notes: note };
      return next;
    });
    setEditingItemNotesIndex(null);
  };

  // Barcode and Fast Enter-to-Add handler
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = searchQuery.trim().toLowerCase();
      if (!term) return;

      // 1. Exact match by code
      const exactCodeMatch = visibleProducts.find(
        p => p.code.toLowerCase() === term
      );
      if (exactCodeMatch) {
        handleProductCardClick(exactCodeMatch);
        setSearchQuery('');
        return;
      }

      // 2. Single match in filtered list
      if (filteredProducts.length === 1) {
        handleProductCardClick(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  // Add Combo shortcut (e.g. Combo Almuerzo + Soda Coca-Cola)
  const handleAddCombo = (comboType: 'almuerzo_soda' | 'salchipapa_soda') => {
    if (comboType === 'almuerzo_soda') {
      const almuerzo = products.find(p => p.id === 'prep-almuerzo');
      const soda = products.find(p => p.id === 'store-coca-individual');
      if (almuerzo) addToCart(almuerzo);
      if (soda) addToCart(soda);
    } else if (comboType === 'salchipapa_soda') {
      const salchipapa = products.find(p => p.id === 'prep-salchipapa');
      const soda = products.find(p => p.id === 'store-coca-individual');
      if (salchipapa) addToCart(salchipapa);
      if (soda) addToCart(soda);
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Save to table / comanda
  const handleSaveToTable = () => {
    if (cart.length === 0) {
      alert('Agregue productos antes de guardar la comanda.');
      return;
    }
    if (!selectedTableNumber) {
      alert('Seleccione una mesa para guardar la comanda en espera.');
      return;
    }

    const table = tables.find(t => t.number === selectedTableNumber);
    if (!table) return;

    saveOrderToTable(table.id, cart, orderNotes);
    alert(`Comanda guardada con éxito en ${table.name}.`);
    setCart([]);
    setSelectedTableNumber('');
    setOrderNotes('');
    if (onClearInitialTableOrder) onClearInitialTableOrder();
  };

  // Resume a held order
  const handleResumeHoldOrder = (order: HoldOrder) => {
    setCart(order.items);
    setSelectedTableNumber(order.tableNumber || '');
    setOrderNotes(order.notes || '');
    deleteHoldOrder(order.id);
  };

  // Complete Payment Confirmation
  const handleConfirmPayment = (payment: PaymentBreakdown) => {
    const res = completeSale(cart, payment, selectedTableNumber || null, discountAmount);
    if (!res.success) {
      alert(res.error || 'Error al procesar la venta.');
      return;
    }

    setIsPaymentOpen(false);
    setCompletedSale(res.sale || null);
    setCart([]);
    setSelectedTableNumber('');
    setOrderNotes('');
    setDiscountAmount(0);
    if (onClearInitialTableOrder) onClearInitialTableOrder();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* COLUMN 1: Categories & Quick Filters (Left) */}
      <aside className="w-full lg:w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
        <div className="hidden lg:block pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Categorías
          </span>
        </div>

        {[
          { id: 'ALL', label: 'Todo el Menú', icon: UtensilsCrossed },
          { id: 'PREPARADO', label: 'Preparados', icon: UtensilsCrossed },
          { id: 'CONGELADO', label: 'Congelados', icon: Snowflake },
          { id: 'TIENDA', label: 'Tienda & Bebidas', icon: Store },
          { id: 'SERVICIO', label: 'Servicios', icon: HelpCircle },
        ].map(cat => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap lg:whitespace-normal text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* Quick Combos Section */}
        <div className="hidden lg:block pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Combos del Día
          </span>
          <div className="space-y-1.5">
            <button
              onClick={() => handleAddCombo('almuerzo_soda')}
              className="w-full p-2 text-left text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 cursor-pointer"
            >
              <div className="font-bold flex items-center gap-1">
                <Tag className="w-3 h-3" /> Combo Almuerzo
              </div>
              <span className="text-[11px] text-slate-500">1 Almuerzo + 1 Soda</span>
            </button>
            <button
              onClick={() => handleAddCombo('salchipapa_soda')}
              className="w-full p-2 text-left text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:bg-rose-100 cursor-pointer"
            >
              <div className="font-bold flex items-center gap-1">
                <Tag className="w-3 h-3" /> Combo Salchipapa
              </div>
              <span className="text-[11px] text-slate-500">1 Salchipapa + 1 Soda</span>
            </button>
          </div>
        </div>

        {/* Ventas en Espera Button on Left Bar */}
        <div className="hidden lg:block pt-3 mt-auto border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsHoldOrdersOpen(true)}
            className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>En Espera ({shortcuts.HOLD_ORDERS})</span>
            </span>
            {holdOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-extrabold">
                {holdOrders.length}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* COLUMN 2: Product Catalog Grid (Center) */}
      <section className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-4">
        {/* Search & Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Buscar o escanear código de barras (${shortcuts.FOCUS_SEARCH}) + Enter...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              <Barcode className="w-4 h-4 text-slate-400 hidden sm:block" />
              <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                {shortcuts.FOCUS_SEARCH}
              </kbd>
            </div>
          </div>

          {/* Quick Ventas en Espera Button */}
          <button
            onClick={() => setIsHoldOrdersOpen(true)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-xs"
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Ventas en Espera</span>
            {holdOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono font-bold text-[11px]">
                {holdOrders.length}
              </span>
            )}
            <kbd className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800">
              {shortcuts.HOLD_ORDERS}
            </kbd>
          </button>

          {/* Quick Table link */}
          {onGoToTables && (
            <button
              onClick={onGoToTables}
              className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-xs"
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Plano Mesas</span>
              <kbd className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                {shortcuts.GOTO_TABLES}
              </kbd>
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(prod => {
              const virtualStock = prod.category === 'PREPARADO' ? calculateVirtualStock(prod) : prod.stock;
              const minLimit = prod.minStockAlert ?? 5;
              const isNegative = prod.category !== 'SERVICIO' && virtualStock < 0;
              const isZero = prod.category !== 'SERVICIO' && virtualStock === 0;
              const isLowStock = prod.category !== 'SERVICIO' && virtualStock > 0 && virtualStock <= minLimit;
              const hasPresentations = Boolean(prod.presentations && prod.presentations.length > 0);

              return (
                <button
                  key={prod.id}
                  onClick={() => handleProductCardClick(prod)}
                  className={`group relative flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isNegative
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 hover:border-rose-500 hover:shadow-md'
                      : isZero
                      ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-500 hover:shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md'
                  } ${seniorMode ? 'min-h-[140px]' : ''}`}
                >
                  {/* Photo or color banner */}
                  {prod.imageUrl ? (
                    <div className="w-full h-28 rounded-xl overflow-hidden mb-2.5 bg-slate-100 relative">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {isNegative && (
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-black text-[11px] shadow-sm animate-pulse">
                          Déficit ({virtualStock})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="w-full h-12 rounded-xl mb-2 flex items-center justify-center text-white font-bold text-xs relative"
                      style={{ backgroundColor: prod.colorTag || '#64748B' }}
                    >
                      {prod.category}
                      {isNegative && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-rose-900 text-white font-mono font-bold text-[10px]">
                          {virtualStock}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                          {prod.name}
                        </h3>
                        {hasPresentations && (
                          <span
                            title="Tiene múltiples presentaciones o tamaños"
                            className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {prod.code}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        Bs. {prod.price.toFixed(2)}
                      </span>

                      {/* Stock badge with red numbers for negative / depleted */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums font-mono ${
                          prod.category === 'SERVICIO'
                            ? 'bg-blue-50 text-blue-700'
                            : isNegative
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-black border border-rose-300 dark:border-rose-800 animate-pulse'
                            : isZero
                            ? 'bg-rose-50 text-rose-600 dark:text-rose-400 font-bold border border-rose-200'
                            : isLowStock
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                        title={
                          isNegative
                            ? 'Stock negativo en sistema. Permite venta normal (regularizar inventario después).'
                            : isZero
                            ? 'Stock agotado en sistema. Permite venta normal.'
                            : isLowStock
                            ? `Quedan pocas unidades (Mínimo: ${minLimit})`
                            : undefined
                        }
                      >
                        {prod.category === 'SERVICIO'
                          ? 'Ilimitado'
                          : isNegative
                          ? `${virtualStock} ${prod.unit}`
                          : isZero
                          ? `0 ${prod.unit}`
                          : prod.category === 'PREPARADO'
                          ? `${virtualStock} disp.`
                          : `${virtualStock} ${prod.unit}`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
              <Store className="w-12 h-12 mb-2 opacity-30" />
              <p className="font-bold text-sm">No se encontraron productos en esta categoría</p>
              <p className="text-xs">Pruebe ajustando el buscador o la categoría.</p>
            </div>
          )}
        </div>
      </section>

      {/* COLUMN 3: Current Order / Cart (Right) */}
      <aside className="w-full lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 shadow-lg">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pedido Actual</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full font-mono">
                {cart.reduce((n, i) => n + i.quantity, 0)} items
              </span>
            </h2>

            {cart.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHoldOrdersOpen(true)}
                  title={`Poner venta en espera [Tecla: ${shortcuts.HOLD_ORDERS}]`}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Pausar ({shortcuts.HOLD_ORDERS})</span>
                </button>
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Vaciar
                </button>
              </div>
            )}
          </div>

          {/* Table Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Mesa / Destino:
            </span>
            <select
              value={selectedTableNumber}
              onChange={e => setSelectedTableNumber(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="">Mostrador / Para Llevar</option>
              {tables.map(t => (
                <option key={t.id} value={t.number}>
                  {t.name} ({t.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center px-4">
              <UtensilsCrossed className="w-10 h-10 mb-2 opacity-30" />
              <p className="font-bold text-sm">El pedido está vacío</p>
              <p className="text-xs">
                Toque cualquier producto del catálogo central o escanee un código de barras para agregarlo al carrito.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                      {item.product.name}
                    </h4>
                    {item.presentationName && (
                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.2 rounded">
                        {item.presentationName}
                      </span>
                    )}
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        Bs. {item.unitPrice.toFixed(2)} c/u
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-slate-900 dark:text-white text-base tabular-nums">
                      Bs. {(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Notes display */}
                {item.notes && (
                  <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 italic bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                    Nota: {item.notes}
                  </div>
                )}

                {/* Item note edit input */}
                {editingItemNotesIndex === index ? (
                  <div className="mt-2 flex gap-1">
                    <input
                      type="text"
                      defaultValue={item.notes || ''}
                      placeholder="Ej: Sin cebolla, bien tostado..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          updateItemNotes(index, (e.target as HTMLInputElement).value);
                        }
                      }}
                      className="flex-1 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={e => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
                        updateItemNotes(index, input);
                      }}
                      className="px-2 py-1 text-xs bg-emerald-600 text-white rounded font-bold cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                ) : null}

                {/* Controls strip */}
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => setEditingItemNotesIndex(editingItemNotesIndex === index ? null : index)}
                    title="Añadir nota de cocina (Ej: sin cebolla)"
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{item.notes ? 'Editar nota' : '+ Nota cocina'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-bold font-mono text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="w-7 h-7 ml-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                Bs. {cartSubtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Descuento / Rebaja:</span>
              <div className="flex items-center gap-1">
                <span>Bs.</span>
                <input
                  type="number"
                  min="0"
                  max={cartSubtotal}
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-16 px-1.5 py-0.5 text-right font-mono text-xs border rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-slate-900 dark:text-white">
              <span className="text-base font-extrabold">TOTAL A PAGAR:</span>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                Bs. {cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              title={`Cobrar Venta [Tecla: ${shortcuts.QUICK_PAY}]`}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                cart.length === 0
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>COBRAR VENTA (Bs. {cartTotal.toFixed(2)})</span>
              <kbd className="ml-1 px-2 py-0.5 text-xs font-mono font-bold bg-white/20 text-white rounded border border-white/30">
                {shortcuts.QUICK_PAY}
              </kbd>
            </button>

            {selectedTableNumber && (
              <button
                disabled={cart.length === 0}
                onClick={handleSaveToTable}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Guardar Comanda en Mesa {selectedTableNumber}</span>
              </button>
            )}

            {/* Quick shortcuts cheat sheet for cashiers */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Atajos POS:</span>
              <div className="flex flex-wrap gap-1 font-mono">
                <span className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded">[{shortcuts.QUICK_PAY}] Cobrar</span>
                <span className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded">[{shortcuts.FOCUS_SEARCH}] Buscar</span>
                <span className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded">[{shortcuts.HOLD_ORDERS}] En Espera</span>
                <span className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded">[{shortcuts.CLEAR_CART}] Vaciar</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          total={cartTotal}
          tableNumber={selectedTableNumber}
          onClose={() => setIsPaymentOpen(false)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Printable Receipt Modal */}
      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}

      {/* Hold Orders Modal (Ventas en espera - F9) */}
      {isHoldOrdersOpen && (
        <HoldOrdersModal
          currentCart={cart}
          currentTableNumber={selectedTableNumber}
          onClose={() => setIsHoldOrdersOpen(false)}
          onResumeOrder={handleResumeHoldOrder}
          onClearCurrentCart={() => {
            setCart([]);
            setSelectedTableNumber('');
          }}
        />
      )}

      {/* Multiple Presentations Picker Modal */}
      {presentationProduct && (
        <PresentationModal
          product={presentationProduct}
          onSelectPresentation={(presentation) => addToCart(presentationProduct, presentation)}
          onClose={() => setPresentationProduct(null)}
        />
      )}

      {/* Floating Stock Alerts & Min Stock Panel */}
      <StockAlertsPanel onAddToCart={handleProductCardClick} />
    </div>
  );
};
