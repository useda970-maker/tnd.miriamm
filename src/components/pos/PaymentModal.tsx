import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, PaymentBreakdown } from '../../types';
import {
  Banknote,
  QrCode,
  Users,
  CreditCard,
  Split,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  Wallet,
  AlertTriangle,
} from 'lucide-react';

interface PaymentModalProps {
  total: number;
  tableNumber?: string | null;
  onClose: () => void;
  onConfirmPayment: (payment: PaymentBreakdown) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  total,
  tableNumber,
  onClose,
  onConfirmPayment,
}) => {
  const { clients, seniorMode, cashSession } = useStore();

  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState<number>(total);
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [mixedCashAmount, setMixedCashAmount] = useState<number>(Math.floor(total / 2));
  const [mixedCashReceived, setMixedCashReceived] = useState<number>(Math.floor(total / 2));
  const [mixedSecondaryMethod, setMixedSecondaryMethod] = useState<'QR' | 'FIADO' | 'MONEDERO'>('QR');
  const [isQrConfirmed, setIsQrConfirmed] = useState<boolean>(false);

  // Exact Cambio calculation (NEVER "Vuelto")
  const changeAmount = useMemo(() => {
    return Math.max(0, cashReceived - total);
  }, [cashReceived, total]);

  const mixedSecondaryAmount = Math.max(0, total - mixedCashAmount);
  const mixedChange = Math.max(0, mixedCashReceived - mixedCashAmount);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  const handleAddBill = (bill: number) => {
    setCashReceived(prev => (prev === 0 ? bill : prev + bill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'EFECTIVO') {
      if (cashReceived < total) {
        alert(`El efectivo recibido (Bs. ${cashReceived.toFixed(2)}) es menor al total a pagar.`);
        return;
      }
      onConfirmPayment({
        method: 'EFECTIVO',
        amount: total,
        cashReceived,
        change: changeAmount,
      });
    } else if (method === 'QR') {
      onConfirmPayment({
        method: 'QR',
        amount: total,
        qrRef: `QR-${Date.now().toString().slice(-6)}`,
      });
    } else if (method === 'FIADO') {
      if (!selectedClientId) {
        alert('Por favor seleccione el cliente que asume el fiado.');
        return;
      }
      onConfirmPayment({
        method: 'FIADO',
        amount: total,
        clientId: selectedClientId,
      });
    } else if (method === 'MONEDERO') {
      if (!selectedClientId) {
        alert('Por favor seleccione el cliente titular del monedero.');
        return;
      }
      if (selectedClient && selectedClient.walletBalance < total) {
        alert(
          `Saldo insuficiente en el monedero de ${selectedClient.name}. Dispone de Bs. ${selectedClient.walletBalance.toFixed(
            2
          )}, pero el total es Bs. ${total.toFixed(2)}. Puede usar Pago Mixto para abonar el resto.`
        );
        return;
      }
      onConfirmPayment({
        method: 'MONEDERO',
        amount: total,
        clientId: selectedClientId,
      });
    } else if (method === 'PAGO_MIXTO') {
      if (mixedCashReceived < mixedCashAmount) {
        alert('El efectivo recibido para la parte en efectivo es menor al monto fijado.');
        return;
      }

      if (mixedSecondaryMethod === 'MONEDERO') {
        if (!selectedClientId) {
          alert('Seleccione el cliente titular del monedero.');
          return;
        }
        if (selectedClient && selectedClient.walletBalance < mixedSecondaryAmount) {
          alert(
            `Saldo insuficiente en el monedero del cliente. Dispone de Bs. ${selectedClient.walletBalance.toFixed(
              2
            )}, pero la parte a cubrir es Bs. ${mixedSecondaryAmount.toFixed(2)}.`
          );
          return;
        }
      }

      onConfirmPayment({
        method: 'PAGO_MIXTO',
        amount: total,
        clientId:
          mixedSecondaryMethod === 'FIADO' || mixedSecondaryMethod === 'MONEDERO'
            ? selectedClientId
            : undefined,
        mixedDetails: {
          cashAmount: mixedCashAmount,
          cashReceived: mixedCashReceived,
          change: mixedChange,
          secondaryMethod: mixedSecondaryMethod,
          secondaryAmount: mixedSecondaryAmount,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] ${
          seniorMode ? 'text-lg' : 'text-base'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cobrar Venta</h2>
              <p className="text-xs text-slate-300">
                {tableNumber ? `Comanda de ${tableNumber}` : 'Venta de mostrador / llevar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancelar y volver al carrito"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Total to pay banner */}
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300">
              Total a Cobrar
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
              Bs. {total.toFixed(2)}
            </div>
          </div>

          {!cashSession.isOpen && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs font-semibold rounded-lg border border-rose-300 dark:border-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Caja cerrada: No se permite cobro en efectivo</span>
            </div>
          )}
        </div>

        {/* Payment Methods Selector */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Seleccione la forma de pago:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote, disabled: !cashSession.isOpen },
                { id: 'QR', label: 'Pago QR', icon: QrCode, disabled: false },
                { id: 'FIADO', label: 'Fiado (Crédito)', icon: Users, disabled: false },
                { id: 'MONEDERO', label: 'Monedero / Saldo', icon: CreditCard, disabled: false },
                { id: 'PAGO_MIXTO', label: 'Pago Mixto', icon: Split, disabled: !cashSession.isOpen },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = method === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => setMethod(item.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200'
                        : isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span className="text-xs sm:text-sm font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form views according to method */}
          {method === 'EFECTIVO' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Efectivo Recibido del Cliente (Bs.):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      Bs.
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min={total}
                      value={cashReceived || ''}
                      onChange={e => setCashReceived(parseFloat(e.target.value) || 0)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-2xl font-black font-mono text-right tabular-nums text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Cambio Display - Strict Rule: "Cambio", Never "Vuelto" */}
                <div
                  className={`w-full sm:w-1/2 p-4 rounded-xl text-center border ${
                    cashReceived >= total
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                      : 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                  }`}
                >
                  <span className="block text-xs uppercase font-extrabold tracking-wider">
                    {cashReceived >= total ? 'CAMBIO A ENTREGAR:' : 'FALTA POR PAGAR:'}
                  </span>
                  <div className="text-3xl font-black font-mono tabular-nums">
                    Bs.{' '}
                    {cashReceived >= total
                      ? changeAmount.toFixed(2)
                      : (total - cashReceived).toFixed(2)}
                  </div>
                  <span className="text-[11px] font-medium opacity-80">
                    {cashReceived >= total
                      ? 'Entregue este cambio exacto al cliente'
                      : 'El cliente debe abonar la diferencia'}
                  </span>
                </div>
              </div>

              {/* Quick bill shortcut buttons */}
              <div>
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Billetes rápidos y monto exacto:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(total)}
                    className="py-2 px-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Exacto ({total.toFixed(0)})
                  </button>
                  {[20, 50, 100, 150, 200].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickCash(amount)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        cashReceived === amount
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Bs. {amount}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-slate-500 self-center">Sumar billete:</span>
                  {[10, 20, 50, 100].map(bill => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => handleAddBill(bill)}
                      className="px-2 py-1 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                    >
                      +{bill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {method === 'QR' && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-3 rounded-xl border-2 border-slate-800 shadow-md text-center">
                {/* Visual QR Code SVG simulation */}
                <svg viewBox="0 0 100 100" className="w-36 h-36">
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="28" height="28" fill="#0f172a" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="#0f172a" />

                  <rect x="67" y="5" width="28" height="28" fill="#0f172a" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="#0f172a" />

                  <rect x="5" y="67" width="28" height="28" fill="#0f172a" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="#0f172a" />

                  <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                  <rect x="40" y="40" width="20" height="20" fill="#10b981" />
                  <rect x="15" y="45" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="72" width="6" height="6" fill="#0f172a" />
                  <rect x="70" y="55" width="6" height="6" fill="#0f172a" />
                  <rect x="80" y="75" width="6" height="6" fill="#0f172a" />
                  <rect x="65" y="80" width="8" height="8" fill="#0f172a" />
                </svg>
                <span className="block text-[11px] font-bold text-slate-600 mt-1">
                  SIMPLE QR Bolivia
                </span>
              </div>

              <div className="space-y-3 flex-1">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Pida al cliente escanear el QR
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cuenta: Banco Unión - Tienda Miriam (Cta: 1000-291823)
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Monto cargado: Bs. {total.toFixed(2)}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isQrConfirmed}
                      onChange={e => setIsQrConfirmed(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Verificado: Transferencia acreditada en el celular
                  </label>
                </div>
              </div>
            </div>
          )}

          {method === 'FIADO' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <Users className="w-5 h-5" />
                <span>Venta a Crédito / Fiado para clientes de confianza</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seleccionar Cliente:
                </label>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Deuda actual: Bs. {c.currentDebt.toFixed(2)} / Límite: Bs.{' '}
                      {c.creditLimit.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedClient && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                    <span>Deuda actual del cliente:</span>
                    <span className="font-mono">Bs. {selectedClient.currentDebt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Nueva deuda tras esta venta:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      Bs. {(selectedClient.currentDebt + total).toFixed(2)}
                    </span>
                  </div>
                  {selectedClient.oldestDebtDate && (
                    <div className="flex items-center gap-1 text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Tiene fiados pendientes desde: {selectedClient.oldestDebtDate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MONEDERO / SALDO A FAVOR */}
          {method === 'MONEDERO' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <Wallet className="w-5 h-5" />
                <span>Cobro mediante Saldo a Favor / Monedero Prepagado</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Buscar y Seleccionar Cliente:
                </label>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Saldo Disponible: Bs. {c.walletBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedClient && (
                <div
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    selectedClient.walletBalance >= total
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                      Saldo disponible en Monedero:
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                      Bs. {selectedClient.walletBalance.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Monto a descontar por la compra:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      - Bs. {total.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
                    <span>Saldo restante posterior:</span>
                    <span
                      className={`font-mono text-sm ${
                        selectedClient.walletBalance >= total
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      Bs. {(selectedClient.walletBalance - total).toFixed(2)}
                    </span>
                  </div>

                  {selectedClient.walletBalance < total && (
                    <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-lg flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Saldo insuficiente (Faltan Bs. {(total - selectedClient.walletBalance).toFixed(2)}). Puede cambiar a <strong>Pago Mixto</strong> para cobrar la diferencia en efectivo.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {method === 'PAGO_MIXTO' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Dividir el total (Bs. {total.toFixed(2)}) en dos métodos:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Part 1: Cash */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-700">
                    Parte 1: Efectivo
                  </span>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Monto fijado:</label>
                    <input
                      type="number"
                      step="1"
                      max={total}
                      min={0}
                      value={mixedCashAmount}
                      onChange={e => setMixedCashAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-right font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Efectivo recibido:</label>
                    <input
                      type="number"
                      step="1"
                      min={mixedCashAmount}
                      value={mixedCashReceived}
                      onChange={e => setMixedCashReceived(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-right font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Cambio: Bs. {mixedChange.toFixed(2)}
                  </div>
                </div>

                {/* Part 2: Secondary Method */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400">
                    Parte 2: Segundo Método
                  </span>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Método restante:</label>
                    <select
                      value={mixedSecondaryMethod}
                      onChange={e => setMixedSecondaryMethod(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="QR">Código QR</option>
                      <option value="FIADO">Fiado a Cliente</option>
                      <option value="MONEDERO">Monedero / Saldo a Favor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">Monto restante a cubrir:</label>
                    <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                      Bs. {mixedSecondaryAmount.toFixed(2)}
                    </div>
                  </div>
                  {(mixedSecondaryMethod === 'FIADO' || mixedSecondaryMethod === 'MONEDERO') && (
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Cliente titular:</label>
                      <select
                        value={selectedClientId}
                        onChange={e => setSelectedClientId(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {mixedSecondaryMethod === 'MONEDERO' ? `(Saldo: Bs. ${c.walletBalance.toFixed(2)})` : `(Deuda: Bs. ${c.currentDebt.toFixed(2)})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Volver
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 max-w-sm px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirmar Cobro e Imprimir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
