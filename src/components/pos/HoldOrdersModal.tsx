import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CartItem, HoldOrder } from '../../types';
import {
  Clock,
  Play,
  Trash2,
  X,
  PauseCircle,
  ShoppingBag,
  User,
} from 'lucide-react';

interface HoldOrdersModalProps {
  currentCart: CartItem[];
  currentTableNumber?: string;
  onClose: () => void;
  onResumeOrder: (order: HoldOrder) => void;
  onClearCurrentCart: () => void;
}

export const HoldOrdersModal: React.FC<HoldOrdersModalProps> = ({
  currentCart,
  currentTableNumber,
  onClose,
  onResumeOrder,
  onClearCurrentCart,
}) => {
  const { holdOrders, saveHoldOrder, deleteHoldOrder, shortcuts, seniorMode } = useStore();

  const [activeTab, setActiveTab] = useState<'LIST' | 'SAVE_CURRENT'>(
    currentCart.length > 0 ? 'SAVE_CURRENT' : 'LIST'
  );

  // Form for holding current order
  const [customerName, setCustomerName] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  const currentCartTotal = currentCart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  const handleSaveToHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCart.length === 0) return;

    const finalName = customerName.trim() || `Cliente en Espera #${holdOrders.length + 1}`;
    saveHoldOrder(finalName, currentCart, orderNotes, currentTableNumber || null);
    onClearCurrentCart();
    setActiveTab('LIST');
    setCustomerName('');
    setOrderNotes('');
  };

  const handleResume = (order: HoldOrder) => {
    onResumeOrder(order);
    onClose();
  };

  const handleDelete = (orderId: string, name: string) => {
    if (confirm(`¿Eliminar la venta en espera de "${name}"?`)) {
      deleteHoldOrder(orderId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] ${
          seniorMode ? 'text-lg' : 'text-base'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>Ventas en Espera</span>
                <kbd className="px-2 py-0.5 text-xs font-mono font-bold bg-white/20 text-white rounded border border-white/30">
                  {shortcuts.HOLD_ORDERS}
                </kbd>
              </h2>
              <p className="text-xs text-slate-300">
                Pausa el pedido actual para atender a otro cliente y recupéralo en cualquier momento.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-6 pt-3 gap-2">
          {currentCart.length > 0 && (
            <button
              onClick={() => setActiveTab('SAVE_CURRENT')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'SAVE_CURRENT'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <PauseCircle className="w-4 h-4" />
              <span>Pausar Pedido Actual ({currentCart.length} items)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('LIST')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'LIST'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ventas Pendientes ({holdOrders.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'SAVE_CURRENT' && currentCart.length > 0 && (
            <form onSubmit={handleSaveToHold} className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Resumen del pedido a pausar:
                  </span>
                  <span className="text-lg font-black font-mono text-amber-900 dark:text-amber-200">
                    Bs. {currentCartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  {currentCart.map(i => `${i.quantity}x ${i.product.name}`).join(' • ')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre o Identificador del Cliente:
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Joven polera azul / Don Carlos / Mostrador 2"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas u Observaciones (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Fue al cajero a retirar dinero, regresa en 5 min"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <PauseCircle className="w-5 h-5" />
                  <span>Pausar y Guardar en Espera</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'LIST' && (
            <div className="space-y-3">
              {holdOrders.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                  <Clock className="w-12 h-12 mb-3 opacity-30 text-slate-400" />
                  <p className="font-bold text-base text-slate-600 dark:text-slate-300">
                    No hay ventas en espera actualmente
                  </p>
                  <p className="text-xs max-w-sm mt-1">
                    Cuando un cliente necesite tiempo para pagar o buscar efectivo, puede pausar la comanda usando el atajo{' '}
                    <strong className="text-amber-600 font-mono">[{shortcuts.HOLD_ORDERS}]</strong>.
                  </p>
                </div>
              ) : (
                holdOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-amber-400 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {order.customerName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded font-mono font-bold">
                          {order.ticketNumber}
                        </span>
                        {order.tableNumber && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded font-semibold">
                            Mesa {order.tableNumber}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Hora: {new Date(order.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {order.notes && <span className="italic text-amber-600">• {order.notes}</span>}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        Bs. {order.total.toFixed(2)}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResume(order)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Recuperar Venta</span>
                        </button>

                        <button
                          onClick={() => handleDelete(order.id, order.customerName)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Eliminar orden en espera"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
