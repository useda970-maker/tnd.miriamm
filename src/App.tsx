import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header, ActiveTab } from './components/Header';
import { POSView } from './components/pos/POSView';
import { TablesView } from './components/tables/TablesView';
import { InventoryView } from './components/inventory/InventoryView';
import { CashRegisterView } from './components/cash/CashRegisterView';
import { ClientsView } from './components/clients/ClientsView';
import { AuditView } from './components/audit/AuditView';
import { ReportsView } from './components/reports/ReportsView';
import { CartItem } from './types';
import { getNormalizedKeyString } from './data/shortcuts';

const MainLayout: React.FC = () => {
  const { darkMode, seniorMode, shortcuts, toggleSeniorMode } = useStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [activeTableOrder, setActiveTableOrder] = useState<{
    tableNumber: string;
    items: CartItem[];
  } | null>(null);

  // Global configurable keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused =
        activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      const keyString = getNormalizedKeyString(e);

      // If user is focused on an input, only allow F-keys, modifier combos, or Escape
      if (isInputFocused) {
        const isFunctionKey = /^F\d+$/.test(e.key);
        const hasModifier = e.ctrlKey || e.altKey;
        const isEscape = e.key === 'Escape';
        if (!isFunctionKey && !hasModifier && !isEscape) {
          return;
        }
      }

      if (keyString === shortcuts.GOTO_POS) {
        e.preventDefault();
        setActiveTab('pos');
      } else if (keyString === shortcuts.GOTO_TABLES) {
        e.preventDefault();
        setActiveTab('mesas');
      } else if (keyString === shortcuts.OPEN_CASH) {
        e.preventDefault();
        setActiveTab('caja');
      } else if (keyString === shortcuts.TOGGLE_SENIOR) {
        e.preventDefault();
        toggleSeniorMode();
      } else if (keyString === shortcuts.QUICK_PAY) {
        e.preventDefault();
        if (activeTab !== 'pos') {
          setActiveTab('pos');
        }
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('pos-shortcut-action', { detail: { action: 'QUICK_PAY' } })
          );
        }, 40);
      } else if (keyString === shortcuts.FOCUS_SEARCH) {
        e.preventDefault();
        if (activeTab !== 'pos') {
          setActiveTab('pos');
        }
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('pos-shortcut-action', { detail: { action: 'FOCUS_SEARCH' } })
          );
        }, 40);
      } else if (keyString === shortcuts.CLEAR_CART) {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent('pos-shortcut-action', { detail: { action: 'CLEAR_CART' } })
        );
      } else if (keyString === shortcuts.HOLD_ORDERS) {
        e.preventDefault();
        if (activeTab !== 'pos') {
          setActiveTab('pos');
        }
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('pos-shortcut-action', { detail: { action: 'HOLD_ORDERS' } })
          );
        }, 40);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, activeTab, toggleSeniorMode]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
      } ${seniorMode ? 'senior-mode' : ''}`}
    >
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'pos' && (
          <POSView
            onGoToTables={() => setActiveTab('mesas')}
            initialTableOrder={activeTableOrder}
            onClearInitialTableOrder={() => setActiveTableOrder(null)}
          />
        )}
        {activeTab === 'mesas' && (
          <TablesView
            onOpenTableInPOS={(tableNumber, items) => {
              setActiveTableOrder({ tableNumber, items });
              setActiveTab('pos');
            }}
          />
        )}
        {activeTab === 'inventario' && <InventoryView />}
        {activeTab === 'caja' && <CashRegisterView />}
        {activeTab === 'fiados' && <ClientsView />}
        {activeTab === 'auditoria' && <AuditView />}
        {activeTab === 'reportes' && <ReportsView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
