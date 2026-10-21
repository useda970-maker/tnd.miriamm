export type ProductCategory =
  | 'INSUMO_CRUDO'
  | 'PREPARADO'
  | 'CONGELADO_LOTE'
  | 'ARTICULO_TIENDA'
  | 'SERVICIO';

export type UserRole = 'DUEÑO' | 'CAJERO';

export interface SystemUser {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  email?: string;
}

export type UnitType = 'MASA' | 'VOLUMEN' | 'DISCRETO';

export interface UnitDefinition {
  code: string;
  name: string;
  type: UnitType;
  baseFactor: number; // in grams (mass), ml (vol), or 1 (discrete)
}

export interface RecipeIngredient {
  productId: string;
  productName: string;
  quantity: number; // e.g. 150 (g), 1 (un), 0.5 (kg), 10 (ml)
  unit: string;
}

export interface ProductPresentation {
  id: string;
  name: string; // e.g. "Unidad", "Caja 24u", "Paquete 6u", "Por Mayor (Docena)", "Porción Grande"
  multiplier: number;
  price: number;
  barcode?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  price: number; // Selling price in Bs.
  costPrice: number; // Purchase/production cost in Bs.
  stock: number; // Real stock for Insumo, Congelado, Tienda. Virtual calculation for Preparado.
  unit: string; // Free unit: 'kg' | 'g' | 'lb' | 'oz' | 'L' | 'ml' | 'un' | 'caja' | 'paquete' | 'blíster' | 'porción'
  showInPOS: boolean; // Controls if cashier sees it in POS (Restricción de venta directa)
  canBeUsedAsIngredient: boolean; // Double-role capability (e.g. Insumo / Producto directo)
  imageUrl?: string;
  colorTag?: string; // For rapid visual recognition
  recipe?: RecipeIngredient[]; // For Preparados or Congelados (Escandallo)
  unpackTargetId?: string; // For package breakdown (e.g. 6-pack -> individual)
  unpackUnitsYield?: number; // How many units are yielded
  minStockAlert?: number;
  presentations?: ProductPresentation[];
  // Frozen and batch traceability
  batchNumber?: string;
  expirationDate?: string;
  isSoldByWeight?: boolean;
  weightKg?: number;
  barcode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  notes?: string;
  presentationId?: string;
  presentationName?: string;
}

export type PaymentMethod =
  | 'EFECTIVO'
  | 'QR'
  | 'FIADO'
  | 'MONEDERO'
  | 'PAGO_MIXTO';

export interface PaymentBreakdown {
  method: PaymentMethod;
  amount: number;
  cashReceived?: number;
  change?: number; // Cambio (no 'Vuelto')
  clientId?: string;
  qrRef?: string;
  mixedDetails?: {
    cashAmount: number;
    cashReceived: number;
    change: number;
    secondaryMethod: 'QR' | 'FIADO' | 'MONEDERO';
    secondaryAmount: number;
  };
}

export interface Sale {
  id: string;
  receiptNumber: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment: PaymentBreakdown;
  tableNumber?: string | null;
  cashierName: string;
  status: 'COMPLETADA' | 'ANULADA';
  outboxSynced: boolean;
}

export type TableStatus = 'LIBRE' | 'OCUPADO' | 'POR_COBRAR';

export interface RestaurantTable {
  id: string;
  number: string;
  name: string;
  capacity: number;
  status: TableStatus;
  currentSale?: {
    items: CartItem[];
    openedAt: string;
    notes?: string;
  };
  combinedWith?: string[]; // Table IDs merged into this one
}

export interface CashSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  initialCash: number; // Fondo inicial
  isOpen: boolean;
  // Transactions that affect physical cash:
  cashSales: number;
  debtRepaymentsInCash: number; // Abonos en efectivo
  cashExpenses: number; // Gastos menores en efectivo
  genericPurchasesInCash: number; // Compras genéricas de mercado
  expectedCash: number; // Fondo + VentasEf + AbonosEf - GastosEf - ComprasGenEf
  actualCashCounted?: number; // Real counted at close
  difference?: number; // actual - expected
  closureNotes?: string;
}

export interface GenericPurchase {
  id: string;
  timestamp: string;
  description: string; // e.g. "Compra de verduras frescas y cebolla en mercado campesino"
  amount: number;
  receiptNote?: string; // No formal invoice, informal receipt/note
  cashierName: string;
}

export interface CashExpense {
  id: string;
  timestamp: string;
  concept: string; // e.g. "Bolsa de hielo y carbón para parrilla"
  amount: number;
  authorizedBy: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  currentDebt: number;
  walletBalance: number; // Saldo a Favor / Monedero
  oldestDebtDate?: string;
  debtHistory: {
    id: string;
    date: string;
    concept: string;
    amount: number;
    type: 'CARGO' | 'ABONO' | 'MONEDERO_RECARGA' | 'MONEDERO_CONSUMO';
    balanceAfter: number;
  }[];
}

export interface HoldOrder {
  id: string;
  ticketNumber: string;
  customerName: string;
  openedAt: string;
  items: CartItem[];
  tableNumber?: string | null;
  notes?: string;
  total: number;
}

export interface CashClosingHistory {
  id: string;
  sessionCode: string;
  openedAt: string;
  closedAt: string;
  openedBy: string;
  closedBy: string;
  initialCash: number;
  cashSales: number;
  debtRepaymentsInCash: number;
  walletRechargesInCash: number;
  cashExpenses: number;
  genericPurchasesInCash: number;
  expectedCash: number;
  actualCashCounted: number;
  difference: number;
  status: 'CUADRADA' | 'SOBRANTE' | 'FALTANTE';
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  balancePayable: number;
  purchasesCount: number;
}

export interface SupplierPurchase {
  id: string;
  invoiceNumber?: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  total: number;
  paymentType: 'CONTADO' | 'CREDITO';
  isPaid: boolean;
  notes?: string;
}

export interface InventoryWaste {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  reason: string;
  costLoss: number;
  registeredBy: string;
}

export interface BusinessConfig {
  storeName: string;
  businessType: string;
  legalOwner: string;
  nitCi: string;
  phone: string;
  address: string;
  city: string;
  currency: string;
  receiptFooter: string;
  autoPrintReceipt: boolean;
  enableSoundAlerts: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userName: string;
  action:
    | 'PRECIO_MODIFICADO'
    | 'STOCK_AJUSTADO'
    | 'VENTA_ANULADA'
    | 'APERTURA_CAJA'
    | 'CIERRE_CAJA'
    | 'DESGLOSE_PAQUETE'
    | 'PRODUCCION_LOTE'
    | 'ABONO_FIADO'
    | 'COMPRA_GENERICA'
    | 'GASTO_REGISTRADO'
    | 'MESA_TRANSFERIDA'
    | 'MESA_COMBINADA'
    | 'MERMA_REGISTRADA'
    | 'COMPRA_PROVEEDOR'
    | 'RECARGA_MONEDERO'
    | 'RECETA_MODIFICADA';
  targetItem: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface OutboxItem {
  id: string;
  entityType: 'SALE' | 'STOCK_MOVEMENT' | 'CASH_CLOSING' | 'AUDIT';
  payload: unknown;
  createdAt: string;
  synced: boolean;
  retryCount: number;
}

export type ShortcutActionId =
  | 'QUICK_PAY'
  | 'OPEN_CASH'
  | 'GOTO_TABLES'
  | 'GOTO_POS'
  | 'FOCUS_SEARCH'
  | 'CLEAR_CART'
  | 'HOLD_ORDERS'
  | 'TOGGLE_SENIOR';

export interface ShortcutDefinition {
  id: ShortcutActionId;
  label: string;
  description: string;
  defaultKey: string;
}

export type KeyboardShortcutsMap = Record<ShortcutActionId, string>;


