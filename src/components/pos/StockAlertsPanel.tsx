import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Bell,
  AlertTriangle,
  Flame,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  RefreshCw,
  Info,
  Layers,
} from 'lucide-react';

interface StockAlertsPanelProps {
  onAddToCart: (product: Product) => void;
  onFilterByCategory?: (category: string) => void;
}

export const StockAlertsPanel: React.FC<StockAlertsPanelProps> = ({
  onAddToCart,
}) => {
  const { products, calculateVirtualStock, seniorMode } = useStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'NEGATIVE' | 'LOW'>('ALL');

  // Compute all products with stock alerts
  const alertProducts = useMemo(() => {
    return products
      .filter(p => p.category !== 'SERVICIO')
      .map(p => {
        const currentStock =
          p.category === 'PREPARADO' ? calculateVirtualStock(p) : p.stock;
        const minLimit = p.minStockAlert ?? 5;
        const isNegative = currentStock < 0;
        const isZero = currentStock === 0;
        const isLow = currentStock > 0 && currentStock <= minLimit;

        return {
          product: p,
          currentStock,
          minLimit,
          isNegative,
          isZero,
          isLow,
          isAlert: isNegative || isZero || isLow,
        };
      })
      .filter(item => item.isAlert)
      .sort((a, b) => a.currentStock - b.currentStock); // Most critical (negative first)
  }, [products, calculateVirtualStock]);

  const negativeCount = alertProducts.filter(p => p.isNegative || p.isZero).length;
  const lowCount = alertProducts.filter(p => p.isLow).length;
  const totalAlerts = alertProducts.length;

  const filteredAlerts = useMemo(() => {
    if (filterType === 'NEGATIVE') {
      return alertProducts.filter(p => p.isNegative || p.isZero);
    }
    if (filterType === 'LOW') {
      return alertProducts.filter(p => p.isLow);
    }
    return alertProducts;
  }, [alertProducts, filterType]);

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm sm:max-w-md">
      {/* Floating collapsed pill */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-all cursor-pointer select-none active:scale-95 ${
            negativeCount > 0
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 ring-4 ring-rose-500/20 animate-pulse'
              : totalAlerts > 0
              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400 ring-4 ring-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
          title="Ver alertas de stock mínimo y ventas en negativo"
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {totalAlerts > 0 && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-white text-rose-700 font-mono shadow-xs">
                {totalAlerts}
              </span>
            )}
          </div>

          <div className="text-left">
            <div className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
              <span>Alertas de Stock</span>
              {negativeCount > 0 && (
                <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px] uppercase font-mono font-black">
                  {negativeCount} en rojo
                </span>
              )}
            </div>
            <div className="text-[11px] opacity-90 leading-tight">
              {negativeCount > 0
                ? `${negativeCount} producto(s) en números rojos (-)`
                : totalAlerts > 0
                ? `${totalAlerts} producto(s) en stock mínimo`
                : 'Inventario en niveles óptimos'}
            </div>
          </div>

          <ChevronUp className="w-4 h-4 ml-1 opacity-80" />
        </button>
      ) : (
        /* Floating open panel */
        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] w-[90vw] sm:w-[420px] transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            seniorMode ? 'text-base' : 'text-sm'
          }`}
        >
          {/* Panel Header */}
          <div
            className={`p-4 flex items-center justify-between text-white ${
              negativeCount > 0 ? 'bg-rose-700' : 'bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl">
                {negativeCount > 0 ? (
                  <Flame className="w-5 h-5 text-white animate-bounce" />
                ) : (
                  <Bell className="w-5 h-5 text-amber-300" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight">
                  Alertas de Stock en Vivo
                </h3>
                <p className="text-[11px] text-white/80">
                  {totalAlerts} producto(s) requieren atención en hora pico
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Minimizar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Business rule reassurance banner */}
          <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900 flex items-start gap-2 text-blue-900 dark:text-blue-200 text-xs">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Las ventas nunca se bloquean:</strong> Si el producto físico existe en tienda/cocina pero no se cargó al sistema, puede seguir vendiéndose. El stock se mostrará en <strong>números rojos negativos (-1, -2, -3...)</strong>.
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Todos ({totalAlerts})
            </button>
            <button
              onClick={() => setFilterType('NEGATIVE')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                filterType === 'NEGATIVE'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50'
              }`}
            >
              Números Rojos ({negativeCount})
            </button>
            <button
              onClick={() => setFilterType('LOW')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                filterType === 'LOW'
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50'
              }`}
            >
              Stock Bajo ({lowCount})
            </button>
          </div>

          {/* Products Alert List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
            {filteredAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="font-bold text-xs">No hay productos en este filtro</p>
                <p className="text-[11px]">Todos los productos cumplen con su nivel configurado.</p>
              </div>
            ) : (
              filteredAlerts.map(item => {
                const { product: prod, currentStock, minLimit, isNegative, isZero } = item;
                const isRed = isNegative || isZero;

                return (
                  <div
                    key={prod.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isNegative
                        ? 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 shadow-xs'
                        : isZero
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: isRed ? '#EF4444' : '#F59E0B' }}
                        />
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-mono">{prod.code}</span>
                        <span>•</span>
                        <span>Mínimo: {minLimit} {prod.unit}</span>
                      </div>

                      {/* Ingredient deficit reminder for prepared items */}
                      {prod.category === 'PREPARADO' && isRed && (
                        <div className="mt-1 text-[10px] text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1">
                          <Layers className="w-3 h-3 shrink-0" />
                          <span>Insumos de receta agotados o en déficit</span>
                        </div>
                      )}
                    </div>

                    {/* Stock number & Add button */}
                    <div className="text-right shrink-0">
                      <div
                        className={`font-black font-mono text-base sm:text-lg tabular-nums leading-tight ${
                          isNegative
                            ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-700'
                            : isZero
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {currentStock} {prod.unit}
                      </div>

                      <button
                        onClick={() => onAddToCart(prod)}
                        className="mt-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 ml-auto cursor-pointer shadow-xs active:scale-95"
                        title="Vender este producto (permite venta aunque esté en negativo)"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Vender</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Actualización instantánea por receta y ventas
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
            >
              Minimizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
