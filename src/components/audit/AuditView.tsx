import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AuditRecord } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  History,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const { auditLogs } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesQuery =
      log.targetItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesQuery;
  });

  const getActionBadge = (action: AuditRecord['action']) => {
    switch (action) {
      case 'APERTURA_CAJA':
      case 'CIERRE_CAJA':
        return { label: action.replace('_', ' '), color: 'bg-emerald-100 text-emerald-800' };
      case 'PRECIO_MODIFICADO':
        return { label: 'PRECIO MODIFICADO', color: 'bg-blue-100 text-blue-800' };
      case 'STOCK_AJUSTADO':
        return { label: 'STOCK AJUSTADO', color: 'bg-amber-100 text-amber-800' };
      case 'PRODUCCION_LOTE':
        return { label: 'PRODUCCIÓN LOTE', color: 'bg-purple-100 text-purple-800' };
      case 'DESGLOSE_PAQUETE':
        return { label: 'DESGLOSE PAQUETE', color: 'bg-indigo-100 text-indigo-800' };
      case 'ABONO_FIADO':
        return { label: 'ABONO FIADO', color: 'bg-teal-100 text-teal-800' };
      case 'COMPRA_GENERICA':
        return { label: 'COMPRA MERCADO', color: 'bg-rose-100 text-rose-800' };
      case 'GASTO_REGISTRADO':
        return { label: 'GASTO CAJA', color: 'bg-orange-100 text-orange-800' };
      default:
        return { label: action, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha', 'Usuario', 'Acción', 'Elemento', 'Detalles', 'Valor Previo', 'Nuevo Valor', 'Motivo'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      `"${l.userName}"`,
      `"${l.action}"`,
      `"${l.targetItem}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.previousValue || ''}"`,
      `"${l.newValue || ''}"`,
      `"${l.reason || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_tienda_miriam_${new Date().toISOString().split('T')[0]}.csv`);
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
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
              <span>Auditoría y Bitácora Intocable de Seguridad</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Registro inmutable de cada cambio de precio, ajuste de stock, apertura de caja o
              movimiento sensible.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Descargar CSV Auditoría</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en la auditoría..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-bold">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'PRECIO_MODIFICADO', label: 'Precios' },
              { id: 'STOCK_AJUSTADO', label: 'Stock' },
              { id: 'PRODUCCION_LOTE', label: 'Producción' },
              { id: 'DESGLOSE_PAQUETE', label: 'Desgloses' },
              { id: 'CIERRE_CAJA', label: 'Arqueos' },
              { id: 'ABONO_FIADO', label: 'Abonos' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedAction(f.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  selectedAction === f.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Tipo Acción</th>
                  <th className="py-3 px-4">Objeto Afectado</th>
                  <th className="py-3 px-4">Detalles y Justificación</th>
                  <th className="py-3 px-4 text-right">Antes vs Después</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                        {log.userName}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {log.targetItem}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div>{log.details}</div>
                        {log.reason && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                            Motivo: {log.reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-xs">
                        {log.previousValue && (
                          <span className="line-through text-slate-400 mr-1.5">
                            {log.previousValue}
                          </span>
                        )}
                        {log.newValue && (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {log.newValue}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
