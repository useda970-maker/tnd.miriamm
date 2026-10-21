import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CircleDollarSign,
  PlusCircle,
  MinusCircle,
  ShoppingBag,
  Receipt,
  Lock,
  Unlock,
  Printer,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const {
    cashSession,
    genericPurchases,
    cashExpenses,
    openCashSession,
    closeCashSession,
    registerGenericPurchase,
    registerCashExpense,
    currentUser,
    seniorMode,
  } = useStore();

  // Modals state
  const [isOpenSessionModal, setIsOpenSessionModal] = useState<boolean>(false);
  const [initialFundInput, setInitialFundInput] = useState<number>(200);

  const [isCloseSessionModal, setIsCloseSessionModal] = useState<boolean>(false);
  const [closureNotes, setClosureNotes] = useState<string>('');

  // Cash denomination counter for physical arqueo
  const [billCounts, setBillCounts] = useState<{ [denom: number]: number }>({
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
  });

  const [coinCounts, setCoinCounts] = useState<{ [denom: number]: number }>({
    5: 0,
    2: 0,
    1: 0,
    0.5: 0,
  });

  // Generic purchase modal
  const [isGenericPurchaseModal, setIsGenericPurchaseModal] = useState<boolean>(false);
  const [gpDesc, setGpDesc] = useState<string>('');
  const [gpAmount, setGpAmount] = useState<number>(0);
  const [gpReceipt, setGpReceipt] = useState<string>('');

  // Cash expense modal
  const [isExpenseModal, setIsExpenseModal] = useState<boolean>(false);
  const [expConcept, setExpConcept] = useState<string>('');
  const [expAmount, setExpAmount] = useState<number>(0);

  // Physical cash counted calculation
  const totalPhysicalCashCounted = useMemo(() => {
    let sum = 0;
    Object.entries(billCounts).forEach(([denom, count]) => {
      sum += parseFloat(denom) * count;
    });
    Object.entries(coinCounts).forEach(([denom, count]) => {
      sum += parseFloat(denom) * count;
    });
    return sum;
  }, [billCounts, coinCounts]);

  const cashDifference = totalPhysicalCashCounted - cashSession.expectedCash;

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(initialFundInput, currentUser);
    setIsOpenSessionModal(false);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashSession(totalPhysicalCashCounted, closureNotes);
    setIsCloseSessionModal(false);
  };

  const handleGenericPurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gpAmount <= 0) return;
    registerGenericPurchase(gpDesc, gpAmount, gpReceipt);
    setIsGenericPurchaseModal(false);
    setGpDesc('');
    setGpAmount(0);
    setGpReceipt('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) return;
    registerCashExpense(expConcept, expAmount);
    setIsExpenseModal(false);
    setExpConcept('');
    setExpAmount(0);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CircleDollarSign className="w-7 h-7 text-emerald-600" />
              <span>Arqueo y Cuadre de Caja</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Control matemático estricto del efectivo físico, compras genéricas y gastos menores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {cashSession.isOpen ? (
              <button
                onClick={() => {
                  // Prepopulate counter close to expected for convenience
                  setBillCounts({ 200: 0, 100: 2, 50: 2, 20: 3, 10: 0 });
                  setCoinCounts({ 5: 1, 2: 0, 1: 0, 0.5: 0 });
                  setIsCloseSessionModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Realizar Cierre de Turno / Arqueo</span>
              </button>
            ) : (
              <button
                onClick={() => setIsOpenSessionModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Apertura de Caja con Fondo Inicial</span>
              </button>
            )}
          </div>
        </div>

        {/* Expected Cash Formula Banner (Intocable Formula) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Efectivo Físico Esperado en Cajón (Cálculo Oficial)
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                Bs. {cashSession.expectedCash.toFixed(2)}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span>Estado: {cashSession.isOpen ? '🟢 Turno Abierto' : '🔴 Caja Cerrada'}</span>
                <span>·</span>
                <span>Responsable: {cashSession.openedBy}</span>
              </div>
            </div>

            {/* Formula Breakdown Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full lg:w-auto">
              {/* 1. Fondo Inicial */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 block">Fondo Inicial</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white tabular-nums">
                  +Bs. {cashSession.initialCash.toFixed(2)}
                </span>
              </div>

              {/* 2. Ventas Efectivo */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                  Ventas Efectivo
                </span>
                <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                  +Bs. {cashSession.cashSales.toFixed(2)}
                </span>
              </div>

              {/* 3. Abonos Efectivo */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block">
                  Abonos de Fiados
                </span>
                <span className="text-sm font-black font-mono text-blue-700 dark:text-blue-400 tabular-nums">
                  +Bs. {cashSession.debtRepaymentsInCash.toFixed(2)}
                </span>
              </div>

              {/* 4. Gastos Efectivo */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                  Gastos Menores
                </span>
                <span className="text-sm font-black font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                  -Bs. {cashSession.cashExpenses.toFixed(2)}
                </span>
              </div>

              {/* 5. Compras Genéricas */}
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">
                  Compras Mercado
                </span>
                <span className="text-sm font-black font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                  -Bs. {cashSession.genericPurchasesInCash.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Cash Entry Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Compras Genéricas (Mercado sin factura) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Compras Genéricas de Mercado
                </h3>
              </div>
              <button
                disabled={!cashSession.isOpen}
                onClick={() => setIsGenericPurchaseModal(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Registrar Compra</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Compras en el mercado campesino o proveedores informales (sin factura) pagadas con
              dinero del cajón.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {genericPurchases.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay compras genéricas en este turno.</p>
              ) : (
                genericPurchases.map(gp => (
                  <div
                    key={gp.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {gp.description}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(gp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        · {gp.receiptNote || 'Sin boleta'}
                      </span>
                    </div>
                    <span className="font-bold font-mono text-rose-600 tabular-nums">
                      -Bs. {gp.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: Gastos Menores de Caja */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Gastos Menores de Caja
                </h3>
              </div>
              <button
                disabled={!cashSession.isOpen}
                onClick={() => setIsExpenseModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Registrar Gasto</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Salidas menores del cajón: bolsa de hielo, gas, artículos de limpieza para la tienda.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cashExpenses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay gastos registrados en este turno.</p>
              ) : (
                cashExpenses.map(ce => (
                  <div
                    key={ce.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {ce.concept}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ce.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        · Autoriza: {ce.authorizedBy}
                      </span>
                    </div>
                    <span className="font-bold font-mono text-amber-600 tabular-nums">
                      -Bs. {ce.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal: Apertura de Caja */}
        {isOpenSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <span>Apertura de Turno de Caja</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ingrese el monto en efectivo físico colocado en el cajón como fondo de cambio inicial.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fondo Inicial (Bs.):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={initialFundInput}
                    onChange={e => setInitialFundInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-xl bg-white dark:bg-slate-800"
                  />
                  {[100, 200, 300].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setInitialFundInput(val)}
                      className="px-3 py-2 text-xs font-bold border rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenSessionModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleOpenSubmit}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                >
                  Confirmar Apertura
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Cierre de Caja / Arqueo Detallado con billetes y monedas */}
        {isCloseSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-lg">Cierre y Conteo de Caja (Arqueo)</h3>
                    <p className="text-xs text-slate-300">
                      Cuente los billetes y monedas físicas del cajón
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCloseSessionModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Comparison header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border">
                    <span className="text-xs font-bold text-slate-500 block">Efectivo Esperado</span>
                    <span className="text-xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                      Bs. {cashSession.expectedCash.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      Total Contado en Cajón
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                      Bs. {totalPhysicalCashCounted.toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      cashDifference === 0
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : cashDifference > 0
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">
                      {cashDifference === 0
                        ? 'Caja Exacta'
                        : cashDifference > 0
                        ? 'Sobrante'
                        : 'Faltante'}
                    </span>
                    <span className="text-xl font-black font-mono tabular-nums">
                      Bs. {Math.abs(cashDifference).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bill Denominations Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Conteo de Billetes
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[200, 100, 50, 20, 10].map(denom => (
                      <div
                        key={denom}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Bs. {denom}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={billCounts[denom] || ''}
                          placeholder="0"
                          onChange={e =>
                            setBillCounts({
                              ...billCounts,
                              [denom]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full mt-1 px-2 py-1 text-center font-bold font-mono border rounded bg-white dark:bg-slate-900"
                        />
                        <span className="text-[11px] text-slate-400 block mt-1">
                          = Bs. {((billCounts[denom] || 0) * denom).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coin Denominations Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Conteo de Monedas
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[5, 2, 1, 0.5].map(denom => (
                      <div
                        key={denom}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Bs. {denom.toFixed(2)}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={coinCounts[denom] || ''}
                          placeholder="0"
                          onChange={e =>
                            setCoinCounts({
                              ...coinCounts,
                              [denom]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full mt-1 px-2 py-1 text-center font-bold font-mono border rounded bg-white dark:bg-slate-900"
                        />
                        <span className="text-[11px] text-slate-400 block mt-1">
                          = Bs. {((coinCounts[denom] || 0) * denom).toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Observaciones o Justificación de Cierre:
                  </label>
                  <input
                    type="text"
                    value={closureNotes}
                    onChange={e => setClosureNotes(e.target.value)}
                    placeholder="Ej: Turno de mediodía concluido sin novedades..."
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-800 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCloseSessionModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCloseSubmit}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Confirmar Cierre de Caja
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Registrar Compra Genérica */}
        {isGenericPurchaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <span>Compra Genérica de Mercado (Sin Factura)</span>
              </h3>
              <p className="text-xs text-slate-500">
                El dinero saldrá directamente del cajón de efectivo y afectará el arqueo esperado.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción de lo comprado:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 5 kg de cebolla, ajíes y limones del mercado"
                  value={gpDesc}
                  onChange={e => setGpDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monto pagado en efectivo (Bs.):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={gpAmount || ''}
                  onChange={e => setGpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nota o boleta manual (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Nota de venta manual #102"
                  value={gpReceipt}
                  onChange={e => setGpReceipt(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenericPurchaseModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!gpDesc.trim() || gpAmount <= 0}
                  onClick={handleGenericPurchaseSubmit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 cursor-pointer"
                >
                  Registrar Salida de Dinero
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Registrar Gasto Menor */}
        {isExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-amber-600" />
                <span>Gasto Menor de Caja</span>
              </h3>
              <p className="text-xs text-slate-500">
                Salida de efectivo autorizada por la administración para insumos de emergencia o
                limpieza.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Concepto del gasto:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bolsa de hielo en cubos, fósforos, jabón líquido..."
                  value={expConcept}
                  onChange={e => setExpConcept(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monto en efectivo (Bs.):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={expAmount || ''}
                  onChange={e => setExpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!expConcept.trim() || expAmount <= 0}
                  onClick={handleExpenseSubmit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 cursor-pointer"
                >
                  Registrar Gasto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
