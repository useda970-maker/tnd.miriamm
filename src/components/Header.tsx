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
  Building2,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { ShortcutsConfigModal } from './shortcuts/ShortcutsConfigModal';
import { UserRole } from '../types';

export type ActiveTab =
  | 'pos'
  | 'mesas'
  | 'inventario'
  | 'caja'
  | 'fiados'
  | 'auditoria'
  | 'reportes'
  | 'panel-dueno';

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
    currentUserRole,
    switchUserRole,
    shortcuts,
  } = useStore();

  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState<boolean>(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState<boolean>(false);
  const [enteredPin, setEnteredPin] = React.useState<string>('');
  const [pinError, setPinError] = React.useState<string>('');

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    description: string;
    shortcutKey?: string;
    badge?: string;
  }[] = [
    { id: 'pos', label: 'Ventas (POS)', icon: ShoppingBag, description: 'Cobro rápido, catálogo y pedidos', shortcutKey: shortcuts.GOTO_POS },
    { id: 'mesas', label: 'Mesas', icon: LayoutGrid, description: 'Plano del restaurante y comandas', shortcutKey: shortcuts.GOTO_TABLES },
    { id: 'inventario', label: 'Inventario', icon: Boxes, description: 'Insumos, recetas y producción' },
    { id: 'caja', label: 'Caja y Arqueo', icon: CircleDollarSign, description: 'Turno de caja y gastos', shortcutKey: shortcuts.OPEN_CASH },
    { id: 'fiados', label: 'Clientes y Fiados', icon: Users, description: 'Deudores y cobro de abonos' },
    { id: 'auditoria', label: 'Auditoría', icon: ShieldCheck, description: 'Registro intocable de cambios' },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, description: 'Ganancia bruta y flujo neto' },
    { id: 'panel-dueno', label: 'Panel Dueño', icon: Building2, description: 'Control empresarial, escandallo y recetas', badge: 'PRO' },
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

            {/* User Role Switcher Button */}
            <button
              onClick={() => {
                setEnteredPin('');
                setPinError('');
                setIsRoleModalOpen(true);
              }}
              title="Cambiar Perfil de Usuario (Dueño vs Cajero)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition shadow-xs cursor-pointer ${
                currentUserRole === 'DUEÑO'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">
                {currentUserRole === 'DUEÑO' ? 'Doña Miriam' : 'Cajero'}
              </span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-black ${
                  currentUserRole === 'DUEÑO'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-slate-900'
                }`}
              >
                {currentUserRole}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-bold shadow-xs"
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              )}
              <span className="hidden sm:inline">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
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

      {/* Modal de Cambio de Rol / Autenticación */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Control de Acceso y Roles
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Seleccione el perfil de sesión activa para el sistema:
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  switchUserRole('CAJERO');
                  setIsRoleModalOpen(false);
                  if (activeTab === 'panel-dueno') {
                    setActiveTab('pos');
                  }
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
                  currentUserRole === 'CAJERO'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    CAJERO (Operador POS)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cobros, ventas en espera, arqueo. Sin acceso a catálogo o recetas.
                  </div>
                </div>
                {currentUserRole === 'CAJERO' && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Activo</span>
                )}
              </button>

              <div
                className={`p-3 rounded-xl border transition ${
                  currentUserRole === 'DUEÑO'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>DUEÑO (ADMINISTRADOR)</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-600 text-white font-black">
                        PRO
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Acceso total, panel web, recetas, escandallo y auditoría.
                    </div>
                  </div>
                  {currentUserRole === 'DUEÑO' && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Activo</span>
                  )}
                </div>

                {currentUserRole !== 'DUEÑO' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Ingrese PIN de Seguridad (Predeterminado: 1234):
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={enteredPin}
                      onChange={e => {
                        setEnteredPin(e.target.value);
                        setPinError('');
                      }}
                      placeholder="PIN Dueño"
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono text-center tracking-widest text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                    />
                    {pinError && (
                      <p className="text-[11px] text-rose-500 font-semibold">{pinError}</p>
                    )}
                    <button
                      onClick={() => {
                        const res = switchUserRole('DUEÑO', enteredPin);
                        if (res.success) {
                          setIsRoleModalOpen(false);
                          setActiveTab('panel-dueno');
                        } else {
                          setPinError(res.message);
                        }
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Autenticar como Dueño
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

