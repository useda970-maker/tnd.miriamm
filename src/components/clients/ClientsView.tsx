import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Client } from '../../types';
import {
  Users,
  CreditCard,
  PlusCircle,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  DollarSign,
  Search,
  X,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { clients, registerClientAbono, cashSession } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Abono modal state
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState<boolean>(false);
  const [abonoAmount, setAbonoAmount] = useState<number>(0);
  const [abonoMethod, setAbonoMethod] = useState<'EFECTIVO' | 'QR'>('EFECTIVO');
  const [abonoNotes, setAbonoNotes] = useState<string>('');

  const filteredClients = clients.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalOutstandingDebt = clients.reduce((acc, c) => acc + c.currentDebt, 0);
  const activeDebtorsCount = clients.filter(c => c.currentDebt > 0).length;

  const handleOpenAbono = (client: Client) => {
    setSelectedClient(client);
    setAbonoAmount(client.currentDebt);
    setAbonoNotes('');
    setIsAbonoModalOpen(true);
  };

  const handleAbonoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || abonoAmount <= 0) return;

    if (abonoMethod === 'EFECTIVO' && !cashSession.isOpen) {
      alert('La caja está cerrada. No se pueden recibir abonos en efectivo sin abrir turno.');
      return;
    }

    registerClientAbono(selectedClient.id, abonoAmount, abonoMethod, abonoNotes);
    alert(`Abono registrado por Bs. ${abonoAmount.toFixed(2)} para ${selectedClient.name}.`);
    setIsAbonoModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header and stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-emerald-600" />
              <span>Clientes y Control de Fiados</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Seguimiento riguroso de deudores, antigüedad del fiado y registro de abonos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                Total por Cobrar (Fiados)
              </span>
              <span className="text-xl font-black font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                Bs. {totalOutstandingDebt.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                Clientes Deudores
              </span>
              <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                {activeDebtorsCount} de {clients.length}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o teléfono..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const hasDebt = client.currentDebt > 0;

            return (
              <div
                key={client.id}
                className={`p-5 rounded-2xl border transition-all bg-white dark:bg-slate-900 ${
                  hasDebt
                    ? 'border-amber-200 dark:border-amber-800/60 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      hasDebt
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {hasDebt ? 'Con Deuda Pendiente' : 'Al Día (Bs. 0.00)'}
                  </span>
                </div>

                {/* Debt details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs mb-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Deuda actual:</span>
                    <span
                      className={`font-mono text-base font-black tabular-nums ${
                        hasDebt ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'
                      }`}
                    >
                      Bs. {client.currentDebt.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Límite de fiado autorizado:</span>
                    <span className="font-mono">Bs. {client.creditLimit.toFixed(2)}</span>
                  </div>

                  {client.oldestDebtDate && hasDebt && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1 text-amber-700 dark:text-amber-400 text-[11px] font-semibold">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Debe desde: {client.oldestDebtDate}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {hasDebt ? (
                    <button
                      onClick={() => handleOpenAbono(client)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Registrar Abono</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Ver Historial ({client.debtHistory.length})
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Client History Drawer / Modal */}
        {selectedClient && !isAbonoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Historial de Fiados y Abonos
                  </h3>
                  <p className="text-xs text-slate-500">{selectedClient.name} · Tel: {selectedClient.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {selectedClient.debtHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Sin movimientos registrados para este cliente.
                  </p>
                ) : (
                  selectedClient.debtHistory.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            item.type === 'CARGO'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.type === 'CARGO' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {item.concept}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Fecha: {item.date} · Saldo tras movimiento: Bs.{' '}
                            {item.balanceAfter.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          item.type === 'CARGO' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {item.type === 'CARGO' ? '+' : '-'}Bs. {item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t flex justify-end">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Registrar Abono */}
        {isAbonoModalOpen && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Registrar Abono de Fiado</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cliente:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {selectedClient.name}
                </strong>{' '}
                · Deuda actual:{' '}
                <strong className="text-rose-600 font-mono">
                  Bs. {selectedClient.currentDebt.toFixed(2)}
                </strong>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monto a abonar (Bs.):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max={selectedClient.currentDebt}
                    value={abonoAmount || ''}
                    onChange={e => setAbonoAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setAbonoAmount(selectedClient.currentDebt)}
                    className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    Total
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Método de Cobro:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAbonoMethod('EFECTIVO')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-colors ${
                      abonoMethod === 'EFECTIVO'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Efectivo en Caja
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbonoMethod('QR')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-colors ${
                      abonoMethod === 'QR'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Transferencia / QR
                  </button>
                </div>
                {abonoMethod === 'EFECTIVO' && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    * Ingresará directamente al arqueo de efectivo del cajón.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nota / Observación (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pago entregado por su hijo en ventanilla..."
                  value={abonoNotes}
                  onChange={e => setAbonoNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAbonoModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={abonoAmount <= 0}
                  onClick={handleAbonoSubmit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Confirmar Cobro de Abono
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
