import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  LayoutGrid,
  Boxes,
  CircleDollarSign,
  Users,
  ShieldCheck,
  BarChart3,
  Sun,
  Moon,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
  Unlock,
  Keyboard,
} from 'lucide-react';
import { ShortcutsConfigModal } from './shortcuts/ShortcutsConfigModal';

export type ActiveTab =
  | 'pos'
  | 'mesas'
  | 'inventario'
  | 'caja'
  | 'fiados'
  | 'auditoria'
  | 'reportes';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    seniorMode,
    toggleSeniorMode,
    darkMode,
    toggleDarkMode,
    cashSession,
    isOnline,
    toggleOnlineStatus,
    outbox,
    syncOutboxNow,
    currentUser,
    shortcuts,
  } = useStore();

  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState<boolean>(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; description: string; shortcutKey?: string }[] = [
    { id: 'pos', label: 'Ventas (POS)', icon: ShoppingBag, description: 'Cobro rápido, catálogo y pedidos', shortcutKey: shortcuts.GOTO_POS },
    { id: 'mesas', label: 'Mesas', icon: LayoutGrid, description: 'Plano del restaurante y comandas', shortcutKey: shortcuts.GOTO_TABLES },
    { id: 'inventario', label: 'Inventario', icon: Boxes, description: 'Insumos, recetas y producción' },
    { id: 'caja', label: 'Caja y Arqueo', icon: CircleDollarSign, description: 'Turno de caja y gastos', shortcutKey: shortcuts.OPEN_CASH },
    { id: 'fiados', label: 'Clientes y Fiados', icon: Users, description: 'Deudores y cobro de abonos' },
    { id: 'auditoria', label: 'Auditoría', icon: ShieldCheck, description: 'Registro intocable de cambios' },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, description: 'Ganancia bruta y flujo neto' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-2.5">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('pos')}
              className="text-left group cursor-pointer focus:outline-hidden"
              title="Ir al Punto de Venta Principal"
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-emerald-700 transition-colors">
                  TM
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    Tienda Miriam
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    POS & ERP Restaurante
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single line, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={`${item.label}: ${item.description}${item.shortcutKey ? ` [Tecla: ${item.shortcutKey}]` : ''}`}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.shortcutKey && (
                    <kbd className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                      isActive ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.shortcutKey}
                    </kbd>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Accessibility & System Status Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Senior Accessibility Mode Toggle */}
            <button
              onClick={toggleSeniorMode}
              title={
                seniorMode
                  ? 'Modo Senior Activo: Botones grandes y textos aumentados'
                  : 'Activar Modo Senior: Letras grandes y botones táctiles amplios'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                seniorMode
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo Senior</span>
              <span className="text-[11px] font-mono px-1 py-0.2 rounded bg-amber-200/60 dark:bg-amber-900/60">
                {seniorMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Offline / Outbox Status */}
            <div className="flex items-center">
              <button
                onClick={toggleOnlineStatus}
                title={
                  isOnline
                    ? 'Conectado a la nube. Haga clic para simular Modo Offline (SQLite Local)'
                    : 'Modo Offline activo (SQLite Local en dispositivo). Datos protegidos localmente.'
                }
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                  isOnline
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="hidden md:inline font-mono">
                  {isOnline ? 'Online' : 'Offline (SQLite)'}
                </span>
              </button>

              {outbox.length > 0 && (
                <button
                  onClick={syncOutboxNow}
                  title={`Hay ${outbox.length} transacciones en la cola Outbox esperando sincronizar. Clic para forzar sincronización.`}
                  className="ml-1.5 flex items-center gap-1 px-2 py-1.5 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 cursor-pointer animate-pulse"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span className="font-mono">{outbox.length}</span>
                </button>
              )}
            </div>

            {/* Cash Session Status */}
            <button
              onClick={() => setActiveTab('caja')}
              title={
                cashSession.isOpen
                  ? `Caja Abierta: Bs. ${cashSession.expectedCash.toFixed(2)} esperados. Clic para arqueo.`
                  : 'Caja Cerrada. Clic para abrir turno de caja.'
              }
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                cashSession.isOpen
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
              }`}
            >
              {cashSession.isOpen ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Caja:</span>
                  <span className="font-mono font-bold tabular-nums">
                    Bs. {cashSession.expectedCash.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Caja Cerrada</span>
                </>
              )}
            </button>

            {/* Keyboard Shortcuts Button */}
            <button
              onClick={() => setIsShortcutsOpen(true)}
              title="Configurar Atajos de Teclado del POS (F1, F2, F3, F4, etc.)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">Atajos</span>
              <kbd className="hidden sm:inline font-mono text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
                {shortcuts.QUICK_PAY}
              </kbd>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex lg:hidden items-center gap-1 py-1.5 overflow-x-auto border-t border-slate-100 dark:border-slate-800">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Configuración de Atajos */}
      {isShortcutsOpen && (
        <ShortcutsConfigModal onClose={() => setIsShortcutsOpen(false)} />
      )}
    </header>
  );
};
