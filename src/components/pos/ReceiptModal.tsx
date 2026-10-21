import React from 'react';
import { Sale } from '../../types';
import { Printer, Check, X, Store } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Comprobante de Venta</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket */}
        <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed border-b border-dashed border-slate-300">
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-lg font-bold font-sans tracking-tight">TIENDA Y RESTAURANTE MIRIAM</h2>
            <p className="text-[11px] text-slate-600">Comida Tradicional & Abarrotes</p>
            <p className="text-[10px] text-slate-500">Calle Sucre #240 · Tel: 772-91024</p>
            <p className="text-[10px] text-slate-500">Cochabamba - Bolivia</p>
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            <div className="flex justify-between text-[11px]">
              <span>TICKET: {sale.receiptNumber}</span>
              <span>FECHA: {new Date(sale.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>HORA: {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>CAJERO: {sale.cashierName}</span>
            </div>
            {sale.tableNumber && (
              <div className="text-left font-bold text-slate-800 text-[11px]">
                ORIGEN: MESA {sale.tableNumber}
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-400 my-2"></div>

          {/* Items Table */}
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-12 font-bold text-[11px] pb-1 border-b border-slate-200">
              <span className="col-span-2">CANT</span>
              <span className="col-span-7">DETALLE</span>
              <span className="col-span-3 text-right">TOTAL</span>
            </div>
            {sale.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] py-0.5">
                <span className="col-span-2 font-bold">{item.quantity}x</span>
                <div className="col-span-7">
                  <span className="block">{item.product.name}</span>
                  {item.notes && (
                    <span className="block text-[10px] text-slate-500 italic">
                      Nota: {item.notes}
                    </span>
                  )}
                </div>
                <span className="col-span-3 text-right tabular-nums">
                  Bs. {(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-400 my-2"></div>

          {/* Totals & Payment */}
          <div className="space-y-1 text-[12px]">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span className="tabular-nums">Bs. {sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>DESCUENTO:</span>
                <span className="tabular-nums">-Bs. {sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
              <span>TOTAL A PAGAR:</span>
              <span className="tabular-nums">Bs. {sale.total.toFixed(2)}</span>
            </div>

            <div className="border-t border-dashed border-slate-300 my-2"></div>

            <div className="flex justify-between">
              <span>MÉTODO DE PAGO:</span>
              <span className="font-bold">{sale.payment.method}</span>
            </div>

            {sale.payment.method === 'EFECTIVO' && (
              <>
                <div className="flex justify-between">
                  <span>EFECTIVO RECIBIDO:</span>
                  <span className="tabular-nums">
                    Bs. {(sale.payment.cashReceived || sale.total).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 text-sm">
                  <span>CAMBIO ENTREGADO:</span>
                  <span className="tabular-nums">
                    Bs. {(sale.payment.change || 0).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {sale.payment.method === 'PAGO_MIXTO' && sale.payment.mixedDetails && (
              <div className="text-[11px] space-y-0.5 pt-1">
                <div className="flex justify-between">
                  <span>Efectivo:</span>
                  <span>Bs. {sale.payment.mixedDetails.cashAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Cambio en efectivo:</span>
                  <span>Bs. {sale.payment.mixedDetails.change.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{sale.payment.mixedDetails.secondaryMethod}:</span>
                  <span>Bs. {sale.payment.mixedDetails.secondaryAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-400 my-4"></div>

          <div className="text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-bold">¡GRACIAS POR SU PREFERENCIA!</p>
            <p>Vuelva pronto a Tienda Miriam</p>
            <p className="text-[9px]">Documento no válido como factura fiscal</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-slate-50 flex items-center justify-between gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
