import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { RestaurantTable, CartItem } from '../../types';
import {
  LayoutGrid,
  Users,
  Clock,
  ArrowRightLeft,
  Merge,
  CreditCard,
  PlusCircle,
  X,
  CheckCircle,
  AlertCircle,
  Coffee,
} from 'lucide-react';

interface TablesViewProps {
  onOpenTableInPOS: (tableNumber: string, items: CartItem[]) => void;
}

export const TablesView: React.FC<TablesViewProps> = ({ onOpenTableInPOS }) => {
  const { tables, transferTable, combineTables, clearTable, markTableForPayment } = useStore();

  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [combineTargetId, setCombineTargetId] = useState<string>('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isCombineModalOpen, setIsCombineModalOpen] = useState<boolean>(false);

  const activeCount = tables.filter(t => t.status === 'OCUPADO').length;
  const billingCount = tables.filter(t => t.status === 'POR_COBRAR').length;
  const freeCount = tables.filter(t => t.status === 'LIBRE').length;

  const handleTransfer = () => {
    if (!selectedTable || !transferTargetId) return;
    const res = transferTable(selectedTable.id, transferTargetId);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setIsTransferModalOpen(false);
    setSelectedTable(null);
  };

  const handleCombine = () => {
    if (!selectedTable || !combineTargetId) return;
    const res = combineTables(selectedTable.id, combineTargetId);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setIsCombineModalOpen(false);
    setSelectedTable(null);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header and status summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutGrid className="w-7 h-7 text-emerald-600" />
              <span>Plano Visual de Mesas y Salón</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Administración de comandas, comensales, transferencias y unión de mesas.
            </p>
          </div>

          {/* Quick status counters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{freeCount} Libres</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{activeCount} Ocupadas</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>{billingCount} Por Cobrar</span>
            </div>
          </div>
        </div>

        {/* Tables Floor Plan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map(table => {
            const isSelected = selectedTable?.id === table.id;
            const itemsCount = table.currentSale?.items.reduce((s, i) => s + i.quantity, 0) || 0;
            const tableTotal =
              table.currentSale?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) || 0;

            let statusBg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
            let statusBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
            let statusText = 'Libre';

            if (table.status === 'OCUPADO') {
              statusBg =
                'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 ring-1 ring-amber-400';
              statusBadge = 'bg-amber-500 text-white';
              statusText = 'Ocupada';
            } else if (table.status === 'POR_COBRAR') {
              statusBg =
                'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-800 ring-2 ring-blue-500';
              statusBadge = 'bg-blue-600 text-white animate-pulse';
              statusText = 'Por Cobrar';
            }

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-xs flex flex-col justify-between min-h-[170px] ${statusBg} ${
                  isSelected ? 'ring-3 ring-emerald-500 shadow-md' : 'hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold flex items-center justify-center text-sm">
                        {table.number}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {table.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Users className="w-3 h-3" />
                          <span>Capacidad: {table.capacity} personas</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>

                  {/* Combined tables indicator */}
                  {table.combinedWith && table.combinedWith.length > 0 && (
                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 mb-1">
                      Unida con: Mesa {table.combinedWith.join(', ')}
                    </div>
                  )}

                  {/* Order info if occupied */}
                  {table.currentSale && table.currentSale.items.length > 0 ? (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{itemsCount} productos en comanda</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                          Bs. {tableTotal.toFixed(2)}
                        </span>
                      </div>
                      {table.currentSale.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                          Nota: {table.currentSale.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 text-center text-xs text-slate-400">
                      <span>Mesa limpia y disponible</span>
                    </div>
                  )}
                </div>

                {/* Bottom action button */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {table.status !== 'LIBRE' ? 'Ver Comanda' : 'Abrir Mesa'}
                  </span>
                  <div className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                    Gestionar →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Table Detail Drawer / Panel */}
        {selectedTable && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center">
                  {selectedTable.number}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Detalle de {selectedTable.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Estado actual:{' '}
                    <span className="font-bold uppercase text-emerald-600">
                      {selectedTable.status}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTable(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table order contents */}
            {selectedTable.currentSale && selectedTable.currentSale.items.length > 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-500 grid grid-cols-12">
                    <span className="col-span-2">CANT</span>
                    <span className="col-span-6">PRODUCTO</span>
                    <span className="col-span-4 text-right">SUBTOTAL</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
                    {selectedTable.currentSale.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 py-1.5 px-2 text-xs items-center">
                        <span className="col-span-2 font-bold font-mono">{item.quantity}x</span>
                        <div className="col-span-6">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.product.name}
                          </span>
                          {item.notes && (
                            <span className="block text-[11px] text-amber-600 italic">
                              {item.notes}
                            </span>
                          )}
                        </div>
                        <span className="col-span-4 text-right font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200">
                          Bs. {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center px-2 text-slate-900 dark:text-white font-extrabold text-lg">
                  <span>Total Acumulado Mesa:</span>
                  <span className="text-2xl font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    Bs.{' '}
                    {selectedTable.currentSale.items
                      .reduce((s, i) => s + i.quantity * i.unitPrice, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <Coffee className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="font-bold text-sm">Esta mesa no tiene comanda activa en este momento</p>
                <p className="text-xs">Puede abrir una nueva comanda enviando el pedido desde el POS.</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedTable.currentSale && selectedTable.currentSale.items.length > 0 ? (
                <>
                  <button
                    onClick={() =>
                      onOpenTableInPOS(selectedTable.number, selectedTable.currentSale!.items)
                    }
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cobrar Comanda en POS</span>
                  </button>

                  <button
                    onClick={() => markTableForPayment(selectedTable.id)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Marcar "Por Cobrar"</span>
                  </button>

                  <button
                    onClick={() => {
                      setTransferTargetId('');
                      setIsTransferModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Transferir Mesa</span>
                  </button>

                  <button
                    onClick={() => {
                      setCombineTargetId('');
                      setIsCombineModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <Merge className="w-4 h-4" />
                    <span>Combinar con otra Mesa</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Liberar y cancelar comanda de ${selectedTable.name}?`)) {
                        clearTable(selectedTable.id);
                        setSelectedTable(null);
                      }
                    }}
                    className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold rounded-xl cursor-pointer ml-auto"
                  >
                    Liberar Mesa
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onOpenTableInPOS(selectedTable.number, [])}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear Pedido para {selectedTable.name}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transfer Table Modal */}
        {isTransferModalOpen && selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <span>Transferir comanda de {selectedTable.name}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Seleccione la mesa libre a la cual se trasladarán los comensales y su comanda.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mesa de destino (Solo Libres):
                </label>
                <select
                  value={transferTargetId}
                  onChange={e => setTransferTargetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option value="">-- Seleccione mesa libre --</option>
                  {tables
                    .filter(t => t.id !== selectedTable.id && t.status === 'LIBRE')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Capacidad: {t.capacity})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  disabled={!transferTargetId}
                  onClick={handleTransfer}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Confirmar Traslado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Combine Tables Modal */}
        {isCombineModalOpen && selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Merge className="w-5 h-5 text-amber-600" />
                <span>Combinar Mesas (Grupos que se juntan)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                La comanda de la mesa seleccionada abajo se unirá con la comanda de{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTable.name}</span>.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mesa secundaria a fusionar:
                </label>
                <select
                  value={combineTargetId}
                  onChange={e => setCombineTargetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option value="">-- Seleccione mesa --</option>
                  {tables
                    .filter(t => t.id !== selectedTable.id && t.status !== 'LIBRE')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} (
                        {t.currentSale?.items.reduce((s, i) => s + i.quantity, 0) || 0} items)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCombineModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  disabled={!combineTargetId}
                  onClick={handleCombine}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Unificar Comandas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
