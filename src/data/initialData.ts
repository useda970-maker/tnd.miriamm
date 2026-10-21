import {
  Product,
  RestaurantTable,
  CashSession,
  Client,
  Supplier,
  AuditRecord,
  GenericPurchase,
  CashExpense,
  Sale,
  HoldOrder,
  CashClosingHistory,
  SupplierPurchase,
  InventoryWaste,
  BusinessConfig,
  SystemUser,
} from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Insumos Crudos (Bulk raw materials, not shown in POS by default)
  {
    id: 'raw-papa',
    code: 'INS-001',
    name: 'Papa Holandesa para Freír',
    category: 'INSUMO_CRUDO',
    price: 0,
    costPrice: 5.5,
    stock: 45.5,
    unit: 'kg',
    showInPOS: false,
    canBeUsedAsIngredient: true,
    colorTag: '#CA8A04',
    minStockAlert: 10,
  },
  {
    id: 'raw-carne-molida',
    code: 'INS-002',
    name: 'Carne Molida Especial',
    category: 'INSUMO_CRUDO',
    price: 0,
    costPrice: 32.0,
    stock: 18.0,
    unit: 'kg',
    showInPOS: false,
    canBeUsedAsIngredient: true,
    colorTag: '#DC2626',
    minStockAlert: 5,
  },
  {
    id: 'raw-salchicha',
    code: 'INS-003',
    name: 'Salchicha Vienesa Parrillera',
    category: 'INSUMO_CRUDO',
    price: 0,
    costPrice: 22.0,
    stock: 14.5,
    unit: 'kg',
    showInPOS: false,
    canBeUsedAsIngredient: true,
    colorTag: '#EA580C',
    minStockAlert: 4,
  },
  {
    id: 'raw-aceite',
    code: 'INS-004',
    name: 'Aceite Vegetal de Cocina',
    category: 'INSUMO_CRUDO',
    price: 0,
    costPrice: 12.0,
    stock: 22.0,
    unit: 'L',
    showInPOS: false,
    canBeUsedAsIngredient: true,
    colorTag: '#F59E0B',
    minStockAlert: 6,
  },
  {
    id: 'raw-yuca',
    code: 'INS-005',
    name: 'Yuca Fresca Pelada',
    category: 'INSUMO_CRUDO',
    price: 0,
    costPrice: 4.5,
    stock: 16.0,
    unit: 'kg',
    showInPOS: false,
    canBeUsedAsIngredient: true,
    colorTag: '#D97706',
    minStockAlert: 5,
  },

  // 2. Productos Preparados (Receta Directa, virtual stock, discounts ingredients)
  {
    id: 'prep-salchipapa',
    code: 'PREP-001',
    name: 'Salchipapa Clásica Especial',
    category: 'PREPARADO',
    price: 18.0,
    costPrice: 7.2,
    stock: 0, // Virtual: calculated dynamically from inputs
    unit: 'porción',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    imageUrl: '/src/assets/images/pos_salchipapa_1792549070385.jpg',
    colorTag: '#E11D48',
    presentations: [
      { id: 'pres-salch-1', name: 'Porción Clásica', multiplier: 1, price: 18.0 },
      { id: 'pres-salch-2', name: 'Porción Doble / Familiar', multiplier: 2, price: 32.0 },
    ],
    recipe: [
      { productId: 'raw-papa', productName: 'Papa Holandesa', quantity: 0.25, unit: 'kg' },
      { productId: 'raw-salchicha', productName: 'Salchicha Vienesa', quantity: 0.15, unit: 'kg' },
      { productId: 'raw-aceite', productName: 'Aceite Vegetal', quantity: 0.05, unit: 'L' },
    ],
  },
  {
    id: 'prep-almuerzo',
    code: 'PREP-002',
    name: 'Almuerzo Completo Tradicional',
    category: 'PREPARADO',
    price: 22.0,
    costPrice: 9.5,
    stock: 0, // Virtual
    unit: 'porción',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    imageUrl: '/src/assets/images/pos_almuerzo_1792549071726.jpg',
    colorTag: '#D97706',
    recipe: [
      { productId: 'raw-carne-molida', productName: 'Carne de Res', quantity: 0.2, unit: 'kg' },
      { productId: 'raw-papa', productName: 'Papa para Guarnición', quantity: 0.15, unit: 'kg' },
      { productId: 'raw-aceite', productName: 'Aceite de Cocina', quantity: 0.03, unit: 'L' },
    ],
  },
  {
    id: 'prep-asadito-plato',
    code: 'PREP-003',
    name: 'Asadito al Plato con Yuca',
    category: 'PREPARADO',
    price: 16.0,
    costPrice: 6.8,
    stock: 0, // Virtual: Depends on intermediate product 'frz-asadito' + raw yuca!
    unit: 'porción',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    imageUrl: '/src/assets/images/pos_asadito_1792549071734.jpg',
    colorTag: '#B45309',
    recipe: [
      { productId: 'frz-asadito', productName: 'Asadito Congelado (Intermedio)', quantity: 1, unit: 'un' },
      { productId: 'raw-yuca', productName: 'Yuca Fresca Cocida', quantity: 0.25, unit: 'kg' },
      { productId: 'raw-aceite', productName: 'Aceite para Freír', quantity: 0.04, unit: 'L' },
    ],
  },

  // 3. Productos Congelados (Por Lote: Produced in bulk into freezer, discounts freezer when sold)
  {
    id: 'frz-asadito',
    code: 'FRZ-001',
    name: 'Asadito de Carne (Congelador)',
    category: 'CONGELADO_LOTE',
    price: 8.0, // If sold directly to take away
    costPrice: 3.8,
    stock: 28, // Physical stock in freezer
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: true, // Used as intermediate ingredient in Asadito al Plato!
    imageUrl: '/src/assets/images/pos_asadito_1792549071734.jpg',
    colorTag: '#9333EA',
    minStockAlert: 10,
    recipe: [
      // Batch production rule: 1 unit requires 0.12 kg raw meat
      { productId: 'raw-carne-molida', productName: 'Carne Molida', quantity: 0.12, unit: 'kg' },
    ],
  },
  {
    id: 'frz-empanada',
    code: 'FRZ-002',
    name: 'Empanada de Carne Congelada',
    category: 'CONGELADO_LOTE',
    price: 6.0,
    costPrice: 2.8,
    stock: 18,
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    colorTag: '#8B5CF6',
    minStockAlert: 8,
    recipe: [
      { productId: 'raw-carne-molida', productName: 'Carne Molida', quantity: 0.08, unit: 'kg' },
    ],
  },

  // 4. Artículos de Tienda (Reventa, stock directo, con desglose y doble rol)
  {
    id: 'store-coca-individual',
    code: 'TND-001',
    name: 'Soda Coca-Cola 500ml',
    category: 'ARTICULO_TIENDA',
    price: 7.0,
    costPrice: 4.8,
    stock: 24,
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: true, // Double role: sold in store & used in cooking/marinades
    imageUrl: '/src/assets/images/pos_sodas_1792549071049.jpg',
    colorTag: '#EF4444',
    minStockAlert: 6,
  },
  {
    id: 'store-coca-pack6',
    code: 'TND-002',
    name: 'Paquete de 6 Sodas Coca-Cola 500ml',
    category: 'ARTICULO_TIENDA',
    price: 38.0,
    costPrice: 27.0,
    stock: 6, // 6 whole packs
    unit: 'paquete',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    imageUrl: '/src/assets/images/pos_sodas_1792549071049.jpg',
    colorTag: '#B91C1C',
    unpackTargetId: 'store-coca-individual',
    unpackUnitsYield: 6, // Unpack 1 pack yields 6 individual sodas
    minStockAlert: 2,
  },
  {
    id: 'store-oreo',
    code: 'TND-003',
    name: 'Galletas Oreo Original (Multiformato)',
    category: 'ARTICULO_TIENDA',
    price: 5.5,
    costPrice: 3.5,
    stock: 48,
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: true, // Multifunción: Se vende directa o como insumo para repostería/malteadas
    colorTag: '#2563EB',
    minStockAlert: 10,
    presentations: [
      { id: 'pres-oreo-1', name: 'Unidad Suelta (108g)', multiplier: 1, price: 5.5 },
      { id: 'pres-oreo-24', name: 'Caja Display x24 Unidades', multiplier: 24, price: 118.0 },
      { id: 'pres-oreo-6', name: 'Paquete x4 Unidades', multiplier: 4, price: 20.0 },
    ],
  },
  {
    id: 'frz-pavo-entero',
    code: 'FRZ-003',
    name: 'Pavo Entero Horneable Congelado',
    category: 'CONGELADO_LOTE',
    price: 45.0, // Precio por kilogramo en Bs.
    costPrice: 28.0,
    stock: 35.8, // Stock en kg
    unit: 'kg',
    showInPOS: true,
    canBeUsedAsIngredient: true,
    colorTag: '#7C3AED',
    minStockAlert: 10,
    batchNumber: 'LOTE-PAVO-2026-X11',
    expirationDate: '2026-12-31',
    isSoldByWeight: true,
    presentations: [
      { id: 'pres-pavo-kg', name: 'Por Peso (1 kg)', multiplier: 1, price: 45.0 },
      { id: 'pres-pavo-pieza', name: 'Pieza Entera Mediana (~4.5 kg)', multiplier: 4.5, price: 195.0 },
    ],
  },
  {
    id: 'prep-malteada-oreo',
    code: 'PREP-004',
    name: 'Malteada Artesanal de Oreo',
    category: 'PREPARADO',
    price: 15.0,
    costPrice: 5.8,
    stock: 0, // Virtual
    unit: 'porción',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    colorTag: '#475569',
    presentations: [
      { id: 'pres-malt-1', name: 'Vaso Estándar (350ml)', multiplier: 1, price: 15.0 },
      { id: 'pres-malt-2', name: 'Vaso Gigante (500ml)', multiplier: 1.5, price: 22.0 },
    ],
    recipe: [
      { productId: 'store-oreo', productName: 'Galletas Oreo Original', quantity: 2, unit: 'un' },
      { productId: 'raw-aceite', productName: 'Leche Entera (Insumo)', quantity: 0.25, unit: 'L' },
    ],
  },
  {
    id: 'store-lays',
    code: 'TND-004',
    name: 'Papas Fritas Clásicas 85g',
    category: 'ARTICULO_TIENDA',
    price: 8.0,
    costPrice: 5.5,
    stock: -2, // Demostración de stock negativo (-2 un) por venta en hora pico
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    colorTag: '#F59E0B',
    minStockAlert: 5,
  },
  {
    id: 'store-agua',
    code: 'TND-005',
    name: 'Agua Vital sin Gas 600ml',
    category: 'ARTICULO_TIENDA',
    price: 5.0,
    costPrice: 3.0,
    stock: 2, // Alerta de stock bajo (Mínimo: 6)
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    colorTag: '#06B6D4',
    minStockAlert: 6,
  },

  // 5. Servicios (No inventory tracking)
  {
    id: 'srv-recarga-tigo',
    code: 'SRV-001',
    name: 'Recarga Electrónica Tigo',
    category: 'SERVICIO',
    price: 10.0,
    costPrice: 9.5,
    stock: 999999,
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    colorTag: '#3B82F6',
  },
  {
    id: 'srv-fotocopia',
    code: 'SRV-002',
    name: 'Fotocopia / Impresión B/N',
    category: 'SERVICIO',
    price: 0.5,
    costPrice: 0.1,
    stock: 999999,
    unit: 'un',
    showInPOS: true,
    canBeUsedAsIngredient: false,
    colorTag: '#64748B',
  },
];

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', number: '1', name: 'Mesa 1 (Ventana)', capacity: 4, status: 'LIBRE' },
  { id: 'tbl-2', number: '2', name: 'Mesa 2 (Principal)', capacity: 4, status: 'LIBRE' },
  {
    id: 'tbl-3',
    number: '3',
    name: 'Mesa 3 (Familiar)',
    capacity: 6,
    status: 'OCUPADO',
    currentSale: {
      openedAt: '2026-10-20T18:40:00Z',
      notes: 'Cliente regular - Don Carlos',
      items: [
        {
          product: INITIAL_PRODUCTS.find(p => p.id === 'prep-salchipapa')!,
          quantity: 2,
          unitPrice: 18.0,
          notes: 'Una sin mayonesa',
        },
        {
          product: INITIAL_PRODUCTS.find(p => p.id === 'store-coca-individual')!,
          quantity: 2,
          unitPrice: 7.0,
          notes: 'Bien frías',
        },
      ],
    },
  },
  {
    id: 'tbl-4',
    number: '4',
    name: 'Mesa 4 (Esquina)',
    capacity: 2,
    status: 'POR_COBRAR',
    currentSale: {
      openedAt: '2026-10-20T18:15:00Z',
      notes: 'Pidió la cuenta',
      items: [
        {
          product: INITIAL_PRODUCTS.find(p => p.id === 'prep-asadito-plato')!,
          quantity: 2,
          unitPrice: 16.0,
          notes: 'Con bastante llajwa',
        },
        {
          product: INITIAL_PRODUCTS.find(p => p.id === 'store-agua')!,
          quantity: 1,
          unitPrice: 5.0,
        },
      ],
    },
  },
  { id: 'tbl-5', number: '5', name: 'Mesa 5 (Centro)', capacity: 4, status: 'LIBRE' },
  { id: 'tbl-6', number: '6', name: 'Mesa 6 (Centro)', capacity: 4, status: 'LIBRE' },
  { id: 'tbl-barra-1', number: 'B1', name: 'Barra Asiento 1', capacity: 1, status: 'LIBRE' },
  { id: 'tbl-terraza-1', number: 'T1', name: 'Terraza Jardín 1', capacity: 4, status: 'LIBRE' },
];

export const INITIAL_CASH_SESSION: CashSession = {
  id: 'cash-sess-001',
  openedAt: '2026-10-20T08:00:00Z',
  openedBy: 'Miriam Suárez (Dueña)',
  initialCash: 200.0,
  isOpen: true,
  cashSales: 185.0,
  debtRepaymentsInCash: 50.0, // Don Ramiro pagó 50 Bs.
  cashExpenses: 25.0, // Hielo y carbón
  genericPurchasesInCash: 45.0, // Compra de verduras en el mercado
  expectedCash: 365.0, // 200 + 185 + 50 - 25 - 45 = 365
};

export const INITIAL_GENERIC_PURCHASES: GenericPurchase[] = [
  {
    id: 'gp-001',
    timestamp: '2026-10-20T10:30:00Z',
    description: 'Compra de tomates, cebollas y limones en Mercado Campesino',
    amount: 45.0,
    receiptNote: 'Boleta manual casera #892',
    cashierName: 'Miriam Suárez',
  },
];

export const INITIAL_CASH_EXPENSES: CashExpense[] = [
  {
    id: 'ce-001',
    timestamp: '2026-10-20T11:45:00Z',
    concept: 'Bolsa grande de hielo en cubos y fósforos de cocina',
    amount: 25.0,
    authorizedBy: 'Miriam Suárez',
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Don Ramiro Gómez',
    phone: '772-91024',
    creditLimit: 250.0,
    currentDebt: 65.0,
    walletBalance: 0.0,
    oldestDebtDate: '2026-10-15', // 5 días
    debtHistory: [
      {
        id: 'dh-1',
        date: '2026-10-15',
        concept: '2 Almuerzos Completos + Sodas (Fiado)',
        amount: 58.0,
        type: 'CARGO',
        balanceAfter: 58.0,
      },
      {
        id: 'dh-2',
        date: '2026-10-18',
        concept: 'Compra de galletas y sodas',
        amount: 22.0,
        type: 'CARGO',
        balanceAfter: 80.0,
      },
      {
        id: 'dh-3',
        date: '2026-10-20',
        concept: 'Abono parcial en efectivo en caja',
        amount: 15.0,
        type: 'ABONO',
        balanceAfter: 65.0,
      },
    ],
  },
  {
    id: 'cli-002',
    name: 'Doña Carmen Valenzuela',
    phone: '765-88412',
    creditLimit: 300.0,
    currentDebt: 120.0,
    walletBalance: 0.0,
    oldestDebtDate: '2026-10-08', // 12 días
    debtHistory: [
      {
        id: 'dh-4',
        date: '2026-10-08',
        concept: 'Consumo familiar fin de semana',
        amount: 120.0,
        type: 'CARGO',
        balanceAfter: 120.0,
      },
    ],
  },
  {
    id: 'cli-003',
    name: 'Carlos Méndez (Profesor)',
    phone: '701-44321',
    creditLimit: 150.0,
    currentDebt: 30.0,
    walletBalance: 20.0, // Tiene Bs. 20 a favor en monedero
    oldestDebtDate: '2026-10-18', // 2 días
    debtHistory: [
      {
        id: 'dh-5',
        date: '2026-10-18',
        concept: 'Salchipapa y soda',
        amount: 30.0,
        type: 'CARGO',
        balanceAfter: 30.0,
      },
    ],
  },
  {
    id: 'cli-004',
    name: 'Javier Rocha (Vecino)',
    phone: '722-19830',
    creditLimit: 200.0,
    currentDebt: 0.0,
    walletBalance: 150.0, // Saldo a favor en monedero
    debtHistory: [
      {
        id: 'dh-6',
        date: '2026-10-19',
        concept: 'Recarga anticipada de monedero (QR)',
        amount: 150.0,
        type: 'MONEDERO_RECARGA',
        balanceAfter: 0.0,
      },
    ],
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Distribuidora de Bebidas del Valle',
    contact: 'Lic. Andrés Paredes',
    phone: '4-4528990',
    balancePayable: 450.0,
    purchasesCount: 14,
  },
  {
    id: 'sup-002',
    name: 'Frigorífico San Jorge',
    contact: 'Don Humberto Rivas',
    phone: '717-33201',
    balancePayable: 680.0,
    purchasesCount: 22,
  },
  {
    id: 'sup-003',
    name: 'Mercado Mayorista Campesino',
    contact: 'Asociación de Productores',
    phone: '730-88190',
    balancePayable: 0.0,
    purchasesCount: 31,
  },
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-20T08:00:15Z',
    userName: 'Miriam Suárez',
    action: 'APERTURA_CAJA',
    targetItem: 'Caja Principal #01',
    details: 'Apertura de turno de la mañana con fondo inicial de 200.00 Bs.',
    newValue: 'Bs. 200.00',
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-20T09:15:30Z',
    userName: 'Miriam Suárez',
    action: 'PRODUCCION_LOTE',
    targetItem: 'Asadito de Carne (Congelador)',
    details: 'Producción de lote de 15 asaditos. Se descontaron 1.80 kg de Carne Molida Especial del inventario crudo.',
    previousValue: '13 un',
    newValue: '28 un',
    reason: 'Preparación para el turno de almuerzo',
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-20T09:40:00Z',
    userName: 'Miriam Suárez',
    action: 'DESGLOSE_PAQUETE',
    targetItem: 'Paquete de 6 Sodas Coca-Cola 500ml',
    details: 'Se abrió 1 paquete en el almacén; se restó 1 paquete y se sumaron 6 unidades a Coca-Cola 500ml individual.',
    previousValue: '7 paquetes (Coca Indiv: 18 un)',
    newValue: '6 paquetes (Coca Indiv: 24 un)',
    reason: 'Reponer heladera exhibidora',
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-20T10:30:20Z',
    userName: 'Miriam Suárez',
    action: 'COMPRA_GENERICA',
    targetItem: 'Caja Efectivo',
    details: 'Salida de 45.00 Bs. por compra de verduras frescas en Mercado Campesino sin factura fiscal.',
    newValue: '-45.00 Bs.',
  },
  {
    id: 'aud-005',
    timestamp: '2026-10-20T11:45:10Z',
    userName: 'Miriam Suárez',
    action: 'GASTO_REGISTRADO',
    targetItem: 'Caja Efectivo',
    details: 'Gasto menor autorizado: 25.00 Bs. para hielo y carbón.',
    newValue: '-25.00 Bs.',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-001',
    receiptNumber: 'V-00101',
    timestamp: '2026-10-20T12:15:00Z',
    subtotal: 54.0,
    discount: 0,
    total: 54.0,
    cashierName: 'Miriam Suárez',
    status: 'COMPLETADA',
    outboxSynced: true,
    payment: {
      method: 'EFECTIVO',
      amount: 54.0,
      cashReceived: 100.0,
      change: 46.0,
    },
    items: [
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'prep-salchipapa')!,
        quantity: 2,
        unitPrice: 18.0,
        notes: 'Bien doradas',
      },
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'prep-asadito-plato')!,
        quantity: 1,
        unitPrice: 16.0,
      },
    ],
  },
  {
    id: 'sale-002',
    receiptNumber: 'V-00102',
    timestamp: '2026-10-20T13:05:00Z',
    subtotal: 44.0,
    discount: 0,
    total: 44.0,
    cashierName: 'Miriam Suárez',
    status: 'COMPLETADA',
    outboxSynced: true,
    payment: {
      method: 'QR',
      amount: 44.0,
      qrRef: 'BNB-QR-99412',
    },
    items: [
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'prep-almuerzo')!,
        quantity: 2,
        unitPrice: 22.0,
      },
    ],
  },
  {
    id: 'sale-003',
    receiptNumber: 'V-00103',
    timestamp: '2026-10-20T14:20:00Z',
    subtotal: 25.0,
    discount: 0,
    total: 25.0,
    cashierName: 'Miriam Suárez',
    status: 'COMPLETADA',
    outboxSynced: true,
    payment: {
      method: 'FIADO',
      amount: 25.0,
      clientId: 'cli-001',
    },
    items: [
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'prep-asadito-plato')!,
        quantity: 1,
        unitPrice: 16.0,
      },
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'store-coca-individual')!,
        quantity: 1,
        unitPrice: 7.0,
      },
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'srv-fotocopia')!,
        quantity: 4,
        unitPrice: 0.5,
      },
    ],
  },
];

export const INITIAL_BUSINESS_CONFIG: BusinessConfig = {
  storeName: 'Tienda Miriam',
  businessType: 'Restaurante y Abarrotes',
  legalOwner: 'Miriam Suárez de Rocha',
  nitCi: '4829104018',
  phone: '772-91024',
  address: 'Calle Sucre #240 (Zona Central)',
  city: 'Cochabamba - Bolivia',
  currency: 'Bs.',
  receiptFooter: '¡Gracias por su preferencia! Vuelva pronto a Tienda Miriam.',
  autoPrintReceipt: true,
  enableSoundAlerts: true,
};

export const INITIAL_HOLD_ORDERS: HoldOrder[] = [
  {
    id: 'hold-001',
    ticketNumber: 'ESP-001',
    customerName: 'Cliente en Espera (Para Llevar)',
    openedAt: '2026-10-20T18:50:00Z',
    tableNumber: null,
    notes: 'Para llevar en bolsa térmica, salsa aparte',
    items: [
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'prep-salchipapa')!,
        quantity: 2,
        unitPrice: 18.0,
        notes: 'Sin picante',
      },
      {
        product: INITIAL_PRODUCTS.find(p => p.id === 'store-coca-individual')!,
        quantity: 1,
        unitPrice: 7.0,
      },
    ],
    total: 43.0,
  },
];

export const INITIAL_CASH_CLOSINGS: CashClosingHistory[] = [
  {
    id: 'close-001',
    sessionCode: 'TURNO-2026-10-19-T2',
    openedAt: '2026-10-19T08:00:00Z',
    closedAt: '2026-10-19T21:30:00Z',
    openedBy: 'Miriam Suárez',
    closedBy: 'Miriam Suárez',
    initialCash: 200.0,
    cashSales: 840.0,
    debtRepaymentsInCash: 120.0,
    walletRechargesInCash: 100.0,
    cashExpenses: 65.0,
    genericPurchasesInCash: 110.0,
    expectedCash: 1085.0,
    actualCashCounted: 1085.0,
    difference: 0,
    status: 'CUADRADA',
    notes: 'Jornada completa cuadrada sin diferencias.',
  },
];

export const INITIAL_SUPPLIER_PURCHASES: SupplierPurchase[] = [
  {
    id: 'sp-001',
    invoiceNumber: 'FAC-8812',
    date: '2026-10-19',
    supplierId: 'sup-001',
    supplierName: 'Distribuidora de Bebidas del Valle',
    items: [
      {
        productId: 'store-coca-pack6',
        productName: 'Paquete de 6 Sodas Coca-Cola 500ml',
        quantity: 10,
        unitCost: 27.0,
        total: 270.0,
      },
    ],
    total: 270.0,
    paymentType: 'CREDITO',
    isPaid: false,
    notes: 'Entrega semanal con crédito a 15 días',
  },
];

export const INITIAL_INVENTORY_WASTES: InventoryWaste[] = [
  {
    id: 'wst-001',
    date: '2026-10-19',
    productId: 'raw-papa',
    productName: 'Papa Holandesa para Freír',
    quantity: 2.5,
    unit: 'kg',
    reason: 'Merma de pelado y selección por humedad',
    costLoss: 13.75,
    registeredBy: 'Miriam Suárez',
  },
];

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-owner',
    name: 'Miriam Suárez (Dueña)',
    role: 'DUEÑO',
    pin: '1234',
    email: 'miriam@tiendamiriam.bo',
  },
  {
    id: 'usr-cashier',
    name: 'Cajero Turno Mañana',
    role: 'CAJERO',
    pin: '0000',
    email: 'cajero@tiendamiriam.bo',
  },
];


