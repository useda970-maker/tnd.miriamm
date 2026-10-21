import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileSpreadsheet,
  Printer,
  ShoppingBag,
  CreditCard,
  PieChart,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, genericPurchases, cashExpenses, cashSession, products } = useStore();

  // Metrics computation
  const totalSalesRevenue = useMemo(() => {
    return sales.reduce((acc, s) => acc + s.total, 0);
  }, [sales]);

  // Cost of Goods Sold (COGS) for items actually sold
  const totalCostOfGoodsSold = useMemo(() => {
    let cost = 0;
    sales.forEach(sale => {
      sale.items.forEach(item => {
        cost += item.product.costPrice * item.quantity;
      });
    });
    return cost;
  }, [sales]);

  // Total Generic purchases + supplier purchases
  const totalPurchasesExpenditure = useMemo(() => {
    const generic = genericPurchases.reduce((acc, p) => acc + p.amount, 0);
    // Approximate inventory purchases for day
    return generic + 280.0; // 280 Bs. bulk inputs bought in morning + generic
  }, [genericPurchases]);

  const totalOperatingExpenses = useMemo(() => {
    return cashExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [cashExpenses]);

  // 1. Ganancia Bruta / Operativa (Ventas - Costo Mercancía Vendida. NO resta inventario en almacén)
  const grossOperatingProfit = totalSalesRevenue - totalCostOfGoodsSold;

  // 2. Utilidad Neta (Flujo de Caja Real. Resta TODO: Compras totales de inventario + Gastos)
  const netCashFlowProfit =
    totalSalesRevenue +
    cashSession.debtRepaymentsInCash -
    totalPurchasesExpenditure -
    totalOperatingExpenses;

  // Sales by payment method breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const stats = { EFECTIVO: 0, QR: 0, FIADO: 0, MONEDERO: 0, PAGO_MIXTO: 0 };
    sales.forEach(s => {
      if (stats[s.payment.method] !== undefined) {
        stats[s.payment.method] += s.total;
      }
    });
    return stats;
  }, [sales]);

  // Simulated Hourly Distribution
  const hourlyData = [
    { hour: '08:00', amount: 25 },
    { hour: '10:00', amount: 65 },
    { hour: '12:00', amount: 180 },
    { hour: '13:00', amount: 240 },
    { hour: '14:00', amount: 110 },
    { hour: '18:00', amount: 95 },
    { hour: '20:00', amount: 160 },
  ];
  const maxHourly = Math.max(...hourlyData.map(h => h.amount));

  const handleExportExcel = () => {
    const headers = ['Nro Ticket', 'Fecha y Hora', 'Cajero', 'Metodo Pago', 'Total Venta (Bs.)', 'Productos'];
    const rows = sales.map(s => [
      s.receiptNumber,
      `"${new Date(s.timestamp).toLocaleString()}"`,
      `"${s.cashierName}"`,
      `"${s.payment.method}"`,
      s.total.toFixed(2),
      `"${s.items.map(i => `${i.quantity}x ${i.product.name}`).join('; ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_tienda_miriam_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-emerald-600" />
              <span>Reportes y Dashboard Ejecutivo</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Análisis financiero con distinción estricta de Ganancia Bruta vs Utilidad Neta (Flujo de
              Caja).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Reporte</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar a Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* 5 Big KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Ventas Totales */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Ventas Totales
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              Bs. {totalSalesRevenue.toFixed(2)}
            </div>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">
              {sales.length} comandas registradas
            </span>
          </div>

          {/* 2. Compras Totales */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Compras Totales
            </span>
            <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              Bs. {totalPurchasesExpenditure.toFixed(2)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Mercado + Insumos crudos</span>
          </div>

          {/* 3. Gastos de Operación */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Gastos Operativos
            </span>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              Bs. {totalOperatingExpenses.toFixed(2)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Hielo, gas, servicios</span>
          </div>

          {/* 4. Ganancia Bruta / Operativa (No resta stock guardado) */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Ganancia Bruta
              </span>
              <span
                title="Ventas menos el costo directo de los productos vendidos. NO resta las compras de inventario que aún están guardadas en el almacén."
                className="cursor-help text-emerald-600"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              Bs. {grossOperatingProfit.toFixed(2)}
            </div>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium mt-1 block">
              Margen: {((grossOperatingProfit / (totalSalesRevenue || 1)) * 100).toFixed(0)}% s/ventas
            </span>
          </div>

          {/* 5. Utilidad Neta (Flujo de Caja Real - Resta Todo) */}
          <div className="bg-blue-50 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Flujo de Caja Neto
              </span>
              <span
                title="Efectivo neto real: Entradas de dinero menos TODO el dinero salido (compras de mercado, compras de inventario y gastos operativos)."
                className="cursor-help text-blue-600"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div
              className={`text-2xl font-black font-mono tabular-nums ${
                netCashFlowProfit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-600'
              }`}
            >
              Bs. {netCashFlowProfit.toFixed(2)}
            </div>
            <span className="text-[11px] text-blue-800 dark:text-blue-300 font-medium mt-1 block">
              Liquidez real en mano
            </span>
          </div>
        </div>

        {/* Comparison Callout: Explaining the two profit definitions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Regla Contable de Tienda Miriam: Dos Visiones de Rentabilidad
            </h4>
            <p>
              <strong>1. Ganancia Bruta / Operativa:</strong> Mide cuánto ganas por cada plato y
              artículo vendido (Ventas - Costo de receta). No te castiga si compraste 50 kg de papa o
              carne que aún tienes en la despensa.
            </p>
            <p>
              <strong>2. Utilidad Neta (Flujo de Caja):</strong> Mide cuánto dinero real entró y salió
              hoy de tu bolsillo y de la caja (Ventas + Abonos - Compras de inventario - Gastos de
              caja).
            </p>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Simulated Hourly Sales */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Ventas por Franja Horaria (Hoy)</span>
              </h3>
              <span className="text-xs text-slate-400">Pico: 13:00 (Almuerzos)</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {hourlyData.map(item => {
                const heightPercent = Math.round((item.amount / maxHourly) * 100);
                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {item.amount}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-28 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-emerald-600 rounded-t-lg transition-all"
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Payment Methods Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Distribución por Método de Pago</span>
              </h3>
              <span className="text-xs text-slate-400">Efectivo vs Digitales</span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { method: 'Efectivo', amount: paymentMethodBreakdown.EFECTIVO, color: 'bg-emerald-600' },
                { method: 'Código QR (Banco)', amount: paymentMethodBreakdown.QR, color: 'bg-blue-600' },
                { method: 'Fiados (Crédito a Cobrar)', amount: paymentMethodBreakdown.FIADO, color: 'bg-rose-500' },
                { method: 'Pago Mixto', amount: paymentMethodBreakdown.PAGO_MIXTO, color: 'bg-purple-600' },
              ].map(item => {
                const pct =
                  totalSalesRevenue > 0
                    ? Math.round((item.amount / totalSalesRevenue) * 100)
                    : 0;
                return (
                  <div key={item.method} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{item.method}</span>
                      <span className="font-mono tabular-nums">
                        Bs. {item.amount.toFixed(2)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full ${item.color} rounded-full`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
