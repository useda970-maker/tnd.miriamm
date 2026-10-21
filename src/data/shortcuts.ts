import { KeyboardShortcutsMap, ShortcutDefinition } from '../types';

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  {
    id: 'QUICK_PAY',
    label: 'Cobro Rápido (POS)',
    description: 'Abre la ventana de cobro y cálculo de cambio inmediatamente.',
    defaultKey: 'F2',
  },
  {
    id: 'GOTO_POS',
    label: 'Ir al Catálogo POS',
    description: 'Regresa al Punto de Venta desde cualquier pantalla.',
    defaultKey: 'F1',
  },
  {
    id: 'GOTO_TABLES',
    label: 'Plano de Mesas',
    description: 'Abre la vista de comandas y estado de mesas del restaurante.',
    defaultKey: 'F3',
  },
  {
    id: 'OPEN_CASH',
    label: 'Caja y Arqueo',
    description: 'Acceso directo al control de efectivo, gastos y cierre de turno.',
    defaultKey: 'F4',
  },
  {
    id: 'FOCUS_SEARCH',
    label: 'Buscar Producto',
    description: 'Pone el cursor en el buscador del catálogo de productos.',
    defaultKey: 'F6',
  },
  {
    id: 'CLEAR_CART',
    label: 'Vaciar Carrito',
    description: 'Limpia el pedido en curso tras confirmación rápida.',
    defaultKey: 'F8',
  },
  {
    id: 'HOLD_ORDERS',
    label: 'Ventas en Espera (Pausar/Recuperar)',
    description: 'Guarda la comanda temporalmente o recupera una venta pendiente.',
    defaultKey: 'F9',
  },
  {
    id: 'TOGGLE_SENIOR',
    label: 'Modo Senior (+Tamaño)',
    description: 'Alterna entre vista estándar y modo de alta legibilidad.',
    defaultKey: 'F10',
  },
];

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcutsMap = {
  QUICK_PAY: 'F2',
  GOTO_POS: 'F1',
  GOTO_TABLES: 'F3',
  OPEN_CASH: 'F4',
  FOCUS_SEARCH: 'F6',
  CLEAR_CART: 'F8',
  HOLD_ORDERS: 'F9',
  TOGGLE_SENIOR: 'F10',
};

export const COMMON_SHORTCUT_KEYS: string[] = [
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'Enter',
  'Escape',
  'Space',
  'Ctrl+Enter',
  'Alt+C',
  'Alt+M',
  'Alt+P',
  'Alt+B',
];

/**
 * Normalizes keyboard event into a string matching configured shortcuts
 */
export function getNormalizedKeyString(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey && e.key.length > 1) parts.push('Shift');

  let key = e.key;
  if (key === ' ') key = 'Space';

  // Capitalize single chars if needed
  if (key.length === 1) {
    key = key.toUpperCase();
  }

  // Avoid "Ctrl+Control" or "Alt+Alt"
  if (key !== 'Control' && key !== 'Alt' && key !== 'Shift') {
    parts.push(key);
  }

  return parts.join('+');
}
