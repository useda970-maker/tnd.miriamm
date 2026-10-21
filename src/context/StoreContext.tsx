import React, { createContext, useContext, useState, useEffect } from 'react';
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
  CartItem,
  PaymentBreakdown,
  OutboxItem,
  ShortcutActionId,
  KeyboardShortcutsMap,
  HoldOrder,
  CashClosingHistory,
  SupplierPurchase,
  InventoryWaste,
  BusinessConfig,
  RecipeIngredient,
  UserRole,
  SystemUser,
  ProductPresentation,
} from '../types';
import { DEFAULT_KEYBOARD_SHORTCUTS } from '../data/shortcuts';
import {
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_CASH_SESSION,
  INITIAL_GENERIC_PURCHASES,
  INITIAL_CASH_EXPENSES,
  INITIAL_CLIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SALES,
  INITIAL_HOLD_ORDERS,
  INITIAL_CASH_CLOSINGS,
  INITIAL_SUPPLIER_PURCHASES,
  INITIAL_INVENTORY_WASTES,
  INITIAL_BUSINESS_CONFIG,
  INITIAL_USERS,
} from '../data/initialData';
import { convertUnit, calculateIngredientCost } from '../utils/unitConversion';

interface StoreContextType {
  products: Product[];
  tables: RestaurantTable[];
  cashSession: CashSession;
  genericPurchases: GenericPurchase[];
  cashExpenses: CashExpense[];
  clients: Client[];
  suppliers: Supplier[];
  supplierPurchases: SupplierPurchase[];
  inventoryWastes: InventoryWaste[];
  cashClosings: CashClosingHistory[];
  holdOrders: HoldOrder[];
  businessConfig: BusinessConfig;
  auditLogs: AuditRecord[];
  sales: Sale[];
  outbox: OutboxItem[];
  seniorMode: boolean;
  darkMode: boolean;
  currentUser: string;
  currentUserRole: UserRole;
  currentUserObj: SystemUser;
  users: SystemUser[];
  isOnline: boolean;
  shortcuts: KeyboardShortcutsMap;

  // Role Authentication Action
  switchUserRole: (role: UserRole, pin?: string) => { success: boolean; message: string };

  // Actions
  toggleSeniorMode: () => void;
  toggleDarkMode: () => void;
  toggleOnlineStatus: () => void;
  syncOutboxNow: () => void;
  updateShortcut: (actionId: ShortcutActionId, newKey: string) => void;
  resetShortcutsToDefault: () => void;
  updateBusinessConfig: (newConfig: BusinessConfig) => void;

  // Sales / POS
  completeSale: (
    items: CartItem[],
    payment: PaymentBreakdown,
    tableNumber?: string | null,
    discount?: number
  ) => { success: boolean; sale?: Sale; error?: string };

  // Hold Orders (Ventas en Espera F9)
  saveHoldOrder: (
    customerName: string,
    items: CartItem[],
    notes?: string,
    tableNumber?: string | null
  ) => HoldOrder;
  resumeHoldOrder: (orderId: string) => HoldOrder | undefined;
  deleteHoldOrder: (orderId: string) => void;

  // Inventory, Escandallo & Recipes (Airontium style)
  calculateVirtualStock: (product: Product) => number;
  produceBatch: (productId: string, unitsToProduce: number) => { success: boolean; message: string };
  unpackPackage: (packageProductId: string) => { success: boolean; message: string };
  updateProductStockManual: (productId: string, newStock: number, reason: string) => void;
  updateProductPrice: (productId: string, newPrice: number, reason: string) => void;
  updateProductRecipe: (productId: string, recipe: RecipeIngredient[], updatedCostPrice?: number) => void;
  registerInventoryWaste: (productId: string, quantity: number, reason: string) => void;
  toggleShowInPOS: (productId: string) => void;

  // Product CRUD (Owner Enterprise Management)
  createProduct: (productData: Omit<Product, 'id'>, reason?: string) => Product;
  updateProduct: (product: Product, reason: string) => void;
  deleteProduct: (productId: string, reason: string) => { success: boolean; message: string };

  // Tables
  saveOrderToTable: (tableId: string, items: CartItem[], notes?: string) => void;
  markTableForPayment: (tableId: string) => void;
  clearTable: (tableId: string) => void;
  transferTable: (fromTableId: string, toTableId: string) => { success: boolean; message: string };
  combineTables: (primaryTableId: string, secondaryTableId: string) => { success: boolean; message: string };

  // Cash Register
  openCashSession: (initialCash: number, openedBy: string) => void;
  closeCashSession: (countedCash: number, notes?: string) => void;
  registerGenericPurchase: (description: string, amount: number, receiptNote?: string) => void;
  registerCashExpense: (concept: string, amount: number) => void;

  // Clients, Fiados & Monedero
  registerClientAbono: (clientId: string, amount: number, method: 'EFECTIVO' | 'QR', notes?: string) => void;
  rechargeClientWallet: (clientId: string, amount: number, method: 'EFECTIVO' | 'QR', notes?: string) => void;

  // Suppliers & Replenishment
  registerSupplierPurchase: (purchase: Omit<SupplierPurchase, 'id'>) => void;

  // Audit
  addAuditLog: (
    action: AuditRecord['action'],
    targetItem: string,
    details: string,
    previousValue?: string,
    newValue?: string,
    reason?: string
  ) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_PREFIX = 'tienda_miriam_v1_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or initial
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}tables`);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [cashSession, setCashSession] = useState<CashSession>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}cashSession`);
    return saved ? JSON.parse(saved) : INITIAL_CASH_SESSION;
  });

  const [genericPurchases, setGenericPurchases] = useState<GenericPurchase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}genericPurchases`);
    return saved ? JSON.parse(saved) : INITIAL_GENERIC_PURCHASES;
  });

  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}cashExpenses`);
    return saved ? JSON.parse(saved) : INITIAL_CASH_EXPENSES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}clients`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [supplierPurchases, setSupplierPurchases] = useState<SupplierPurchase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}supplierPurchases`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_PURCHASES;
  });

  const [inventoryWastes, setInventoryWastes] = useState<InventoryWaste[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}inventoryWastes`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_WASTES;
  });

  const [cashClosings, setCashClosings] = useState<CashClosingHistory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}cashClosings`);
    return saved ? JSON.parse(saved) : INITIAL_CASH_CLOSINGS;
  });

  const [holdOrders, setHoldOrders] = useState<HoldOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}holdOrders`);
    return saved ? JSON.parse(saved) : INITIAL_HOLD_ORDERS;
  });

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}businessConfig`);
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_CONFIG;
  });

  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}sales`);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const [seniorMode, setSeniorMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}seniorMode`);
    return saved ? JSON.parse(saved) : true; // Default to true for ease of use!
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}darkMode`);
    return saved ? JSON.parse(saved) : false;
  });
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // User and Role Security (CAJERO vs DUEÑO)
  const [users] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}userRole`);
    return (saved as UserRole) || 'DUEÑO';
  });

  const currentUserObj = users.find(u => u.role === currentUserRole) || users[0];
  const currentUser = currentUserObj.name;

  const [shortcuts, setShortcuts] = useState<KeyboardShortcutsMap>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}shortcuts`);
    return saved ? JSON.parse(saved) : DEFAULT_KEYBOARD_SHORTCUTS;
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}shortcuts`, JSON.stringify(shortcuts));
  }, [shortcuts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}tables`, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}cashSession`, JSON.stringify(cashSession));
  }, [cashSession]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}genericPurchases`, JSON.stringify(genericPurchases));
  }, [genericPurchases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}cashExpenses`, JSON.stringify(cashExpenses));
  }, [cashExpenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}supplierPurchases`, JSON.stringify(supplierPurchases));
  }, [supplierPurchases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}inventoryWastes`, JSON.stringify(inventoryWastes));
  }, [inventoryWastes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}cashClosings`, JSON.stringify(cashClosings));
  }, [cashClosings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}holdOrders`, JSON.stringify(holdOrders));
  }, [holdOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}businessConfig`, JSON.stringify(businessConfig));
  }, [businessConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sales`, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}seniorMode`, JSON.stringify(seniorMode));
  }, [seniorMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}darkMode`, JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleSeniorMode = () => setSeniorMode(prev => !prev);
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleOnlineStatus = () => setIsOnline(prev => !prev);

  const syncOutboxNow = () => {
    setOutbox(prev => prev.map(item => ({ ...item, synced: true })));
    setTimeout(() => {
      setOutbox([]);
    }, 1500);
  };

  const updateShortcut = (actionId: ShortcutActionId, newKey: string) => {
    setShortcuts(prev => ({ ...prev, [actionId]: newKey }));
    addAuditLog(
      'STOCK_AJUSTADO',
      'Atajos de Teclado POS',
      `Configuración de atajo modificada para ${actionId}: nueva tecla asignada [${newKey}]`
    );
  };

  const resetShortcutsToDefault = () => {
    setShortcuts(DEFAULT_KEYBOARD_SHORTCUTS);
    addAuditLog(
      'STOCK_AJUSTADO',
      'Atajos de Teclado POS',
      'Atajos de teclado restaurados a los valores predeterminados de fábrica (F1-F10)'
    );
  };

  const addAuditLog = (
    action: AuditRecord['action'],
    targetItem: string,
    details: string,
    previousValue?: string,
    newValue?: string,
    reason?: string
  ) => {
    const newRecord: AuditRecord = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser,
      action,
      targetItem,
      details,
      previousValue,
      newValue,
      reason,
    };
    setAuditLogs(prev => [newRecord, ...prev]);

    // Push to Outbox pattern queue
    const outboxItem: OutboxItem = {
      id: `outbox-${Date.now()}`,
      entityType: 'AUDIT',
      payload: newRecord,
      createdAt: new Date().toISOString(),
      synced: isOnline,
      retryCount: 0,
    };
    setOutbox(prev => [...prev, outboxItem]);
  };

  // Virtual stock calculation for Prepared Products based on ingredient availability (Airontium free units)
  const calculateVirtualStock = (product: Product): number => {
    if (product.category !== 'PREPARADO' || !product.recipe || product.recipe.length === 0) {
      return product.stock;
    }

    let minServings = Infinity;
    for (const ingredient of product.recipe) {
      const ingProd = products.find(p => p.id === ingredient.productId);
      if (!ingProd) continue;

      const availableStock = ingProd.stock;
      // Convert required recipe quantity (in ingredient.unit) into stock unit of the raw ingredient (ingProd.unit)
      const convertedQuantity = convertUnit(ingredient.quantity, ingredient.unit, ingProd.unit);
      if (convertedQuantity <= 0) continue;

      const servingsFromIngredient = Math.floor(availableStock / convertedQuantity);
      if (servingsFromIngredient < minServings) {
        minServings = servingsFromIngredient;
      }
    }
    return minServings === Infinity ? 0 : Math.max(0, minServings);
  };

  // Complete Sale (POS)
  const completeSale = (
    items: CartItem[],
    payment: PaymentBreakdown,
    tableNumber?: string | null,
    discount = 0
  ): { success: boolean; sale?: Sale; error?: string } => {
    if (items.length === 0) {
      return { success: false, error: 'El carrito de venta está vacío.' };
    }

    if (!cashSession.isOpen && (payment.method === 'EFECTIVO' || payment.method === 'PAGO_MIXTO')) {
      return {
        success: false,
        error: 'La caja está cerrada. Debe realizar la Apertura de Caja antes de cobrar en efectivo.',
      };
    }

    const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const total = Math.max(0, subtotal - discount);

    // Deduct stock strictly according to business logic (allowing negative stock in rush hours without blocking sales)
    setProducts(prevProducts => {
      const updated = [...prevProducts];

      for (const item of items) {
        const prodIndex = updated.findIndex(p => p.id === item.product.id);
        if (prodIndex === -1) continue;
        const prod = updated[prodIndex];

        // Presentation multiplier (e.g. Caja de 24 -> multiplier 24, or Single -> multiplier 1)
        const multiplier = item.presentationId
          ? prod.presentations?.find(p => p.id === item.presentationId)?.multiplier || 1
          : 1;

        if (prod.category === 'PREPARADO' && prod.recipe) {
          // Direct recipe: discounts raw inputs or intermediate frozen products converting units
          for (const ing of prod.recipe) {
            const ingIndex = updated.findIndex(p => p.id === ing.productId);
            if (ingIndex !== -1) {
              const ingProd = updated[ingIndex];
              const totalNeededInRecipeUnit = ing.quantity * item.quantity * multiplier;
              const convertedNeededInStockUnit = convertUnit(
                totalNeededInRecipeUnit,
                ing.unit,
                ingProd.unit
              );

              updated[ingIndex] = {
                ...ingProd,
                stock: parseFloat((ingProd.stock - convertedNeededInStockUnit).toFixed(4)),
              };
            }
          }
        } else if (prod.category === 'CONGELADO_LOTE' || prod.category === 'ARTICULO_TIENDA') {
          // Direct stock discount - allows negative stock (-1, -2, -3...) so high-volume sales are never interrupted
          const totalUnitsToDeduct = item.quantity * multiplier;
          updated[prodIndex] = {
            ...prod,
            stock: parseFloat((prod.stock - totalUnitsToDeduct).toFixed(3)),
          };
        }
      }

      return updated;
    });

    // Update Cash Session if physical cash was collected
    let cashCollected = 0;
    if (payment.method === 'EFECTIVO') {
      cashCollected = total;
    } else if (payment.method === 'PAGO_MIXTO' && payment.mixedDetails) {
      cashCollected = payment.mixedDetails.cashAmount;
    }

    if (cashCollected > 0) {
      setCashSession(prev => ({
        ...prev,
        cashSales: prev.cashSales + cashCollected,
        expectedCash: prev.expectedCash + cashCollected,
      }));
    }

    // If payment method is FIADO, add to client's debt
    if (payment.method === 'FIADO' && payment.clientId) {
      const client = clients.find(c => c.id === payment.clientId);
      if (client) {
        const newDebt = client.currentDebt + total;
        setClients(prevClients =>
          prevClients.map(c =>
            c.id === client.id
              ? {
                  ...c,
                  currentDebt: newDebt,
                  oldestDebtDate: c.oldestDebtDate || new Date().toISOString().split('T')[0],
                  debtHistory: [
                    ...c.debtHistory,
                    {
                      id: `dh-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      concept: `Consumo POS Venta (${items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')})`,
                      amount: total,
                      type: 'CARGO',
                      balanceAfter: newDebt,
                    },
                  ],
                }
              : c
          )
        );
      }
    }

    // If payment method is MONEDERO, deduct from client's walletBalance (Saldo a Favor)
    if (payment.method === 'MONEDERO' && payment.clientId) {
      const client = clients.find(c => c.id === payment.clientId);
      if (client) {
        if (client.walletBalance < total) {
          return {
            success: false,
            error: `Saldo insuficiente en Monedero. El cliente ${client.name} dispone de Bs. ${client.walletBalance.toFixed(2)}, pero el total es Bs. ${total.toFixed(2)}.`,
          };
        }
        const newWallet = client.walletBalance - total;
        setClients(prevClients =>
          prevClients.map(c =>
            c.id === client.id
              ? {
                  ...c,
                  walletBalance: newWallet,
                  debtHistory: [
                    ...c.debtHistory,
                    {
                      id: `dh-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      concept: `Consumo pagado con Monedero (${items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')})`,
                      amount: total,
                      type: 'MONEDERO_CONSUMO',
                      balanceAfter: c.currentDebt,
                    },
                  ],
                }
              : c
          )
        );
      }
    } else if (
      payment.method === 'PAGO_MIXTO' &&
      payment.mixedDetails?.secondaryMethod === 'MONEDERO' &&
      payment.clientId
    ) {
      const client = clients.find(c => c.id === payment.clientId);
      const secondaryAmount = payment.mixedDetails.secondaryAmount;
      if (client) {
        if (client.walletBalance < secondaryAmount) {
          return {
            success: false,
            error: `Saldo insuficiente en Monedero para el pago mixto. Dispone de Bs. ${client.walletBalance.toFixed(2)}.`,
          };
        }
        const newWallet = client.walletBalance - secondaryAmount;
        setClients(prevClients =>
          prevClients.map(c =>
            c.id === client.id
              ? {
                  ...c,
                  walletBalance: newWallet,
                  debtHistory: [
                    ...c.debtHistory,
                    {
                      id: `dh-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      concept: `Pago mixto con Monedero (Bs. ${secondaryAmount.toFixed(2)})`,
                      amount: secondaryAmount,
                      type: 'MONEDERO_CONSUMO',
                      balanceAfter: c.currentDebt,
                    },
                  ],
                }
              : c
          )
        );
      }
    }

    // If sale originated from a table, clear table order
    if (tableNumber) {
      const targetTable = tables.find(t => t.number === tableNumber);
      if (targetTable) {
        clearTable(targetTable.id);
      }
    }

    const receiptNum = `V-${(sales.length + 101).toString().padStart(5, '0')}`;
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber: receiptNum,
      timestamp: new Date().toISOString(),
      items,
      subtotal,
      discount,
      total,
      payment,
      tableNumber,
      cashierName: currentUser,
      status: 'COMPLETADA',
      outboxSynced: isOnline,
    };

    setSales(prev => [newSale, ...prev]);

    // Outbox item
    setOutbox(prev => [
      ...prev,
      {
        id: `outbox-${Date.now()}`,
        entityType: 'SALE',
        payload: newSale,
        createdAt: new Date().toISOString(),
        synced: isOnline,
        retryCount: 0,
      },
    ]);

    addAuditLog(
      'PRECIO_MODIFICADO',
      receiptNum,
      `Venta completada por Bs. ${total.toFixed(2)} (${payment.method}) con ${items.length} productos.`
    );

    return { success: true, sale: newSale };
  };

  // Batch Production for Frozen Products (Productos Congelados)
  const produceBatch = (productId: string, unitsToProduce: number): { success: boolean; message: string } => {
    if (unitsToProduce <= 0) {
      return { success: false, message: 'La cantidad a producir debe ser mayor a 0.' };
    }

    const prod = products.find(p => p.id === productId);
    if (!prod || prod.category !== 'CONGELADO_LOTE' || !prod.recipe) {
      return { success: false, message: 'Este producto no es un congelado configurable por lote.' };
    }

    // Verify raw ingredients
    for (const ing of prod.recipe) {
      const ingProd = products.find(p => p.id === ing.productId);
      const needed = ing.quantity * unitsToProduce;
      if (!ingProd || ingProd.stock < needed) {
        return {
          success: false,
          message: `Insumo insuficiente: ${ing.productName}. Se requieren ${needed.toFixed(
            2
          )} ${ing.unit}, pero solo hay ${ingProd ? ingProd.stock : 0} ${ing.unit}.`,
        };
      }
    }

    // Deduct raw ingredients and add to freezer stock
    let detailsSummary = `Producción de lote: +${unitsToProduce} ${prod.unit} de ${prod.name}. Descontado: `;
    const previousStock = prod.stock;

    setProducts(prev => {
      const updated = [...prev];
      // 1. Deduct raw
      for (const ing of prod.recipe!) {
        const ingIndex = updated.findIndex(p => p.id === ing.productId);
        if (ingIndex !== -1) {
          const needed = ing.quantity * unitsToProduce;
          detailsSummary += `${needed.toFixed(2)} ${ing.unit} de ${ing.productName}, `;
          updated[ingIndex] = {
            ...updated[ingIndex],
            stock: parseFloat((updated[ingIndex].stock - needed).toFixed(3)),
          };
        }
      }
      // 2. Add to freezer
      const prodIndex = updated.findIndex(p => p.id === prod.id);
      if (prodIndex !== -1) {
        updated[prodIndex] = {
          ...updated[prodIndex],
          stock: updated[prodIndex].stock + unitsToProduce,
        };
      }
      return updated;
    });

    addAuditLog(
      'PRODUCCION_LOTE',
      prod.name,
      detailsSummary,
      `${previousStock} ${prod.unit}`,
      `${previousStock + unitsToProduce} ${prod.unit}`,
      'Producción masiva para stock de congelador'
    );

    return {
      success: true,
      message: `¡Lote producido con éxito! Se sumaron ${unitsToProduce} ${prod.unit} al congelador y se descontó la materia prima.`,
    };
  };

  // Desglose: Unpack package into individual units
  const unpackPackage = (packageProductId: string): { success: boolean; message: string } => {
    const pkg = products.find(p => p.id === packageProductId);
    if (!pkg || !pkg.unpackTargetId || !pkg.unpackUnitsYield) {
      return { success: false, message: 'Este producto no tiene configurado un desglose de paquete.' };
    }

    if (pkg.stock < 1) {
      return { success: false, message: `No hay paquetes disponibles en stock de ${pkg.name}.` };
    }

    const target = products.find(p => p.id === pkg.unpackTargetId);
    if (!target) {
      return { success: false, message: 'Producto destino individual no encontrado.' };
    }

    const pkgPrevStock = pkg.stock;
    const targetPrevStock = target.stock;
    const yieldUnits = pkg.unpackUnitsYield;

    setProducts(prev =>
      prev.map(p => {
        if (p.id === pkg.id) {
          return { ...p, stock: p.stock - 1 };
        }
        if (p.id === target.id) {
          return { ...p, stock: p.stock + yieldUnits };
        }
        return p;
      })
    );

    addAuditLog(
      'DESGLOSE_PAQUETE',
      pkg.name,
      `Se abrió 1 ${pkg.unit} de ${pkg.name}. Se sumaron ${yieldUnits} ${target.unit} a ${target.name}.`,
      `${pkg.name}: ${pkgPrevStock} / ${target.name}: ${targetPrevStock}`,
      `${pkg.name}: ${pkgPrevStock - 1} / ${target.name}: ${targetPrevStock + yieldUnits}`,
      'Desglose manual de almacén a mostrador'
    );

    return {
      success: true,
      message: `¡Desglose realizado! Se restó 1 paquete de ${pkg.name} y se sumaron ${yieldUnits} unidades a ${target.name}.`,
    };
  };

  // Manual stock adjustment with mandatory audit logging
  const updateProductStockManual = (productId: string, newStock: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const prevStock = prod.stock;
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p)));

    addAuditLog(
      'STOCK_AJUSTADO',
      prod.name,
      `Ajuste manual de inventario: de ${prevStock} a ${newStock} ${prod.unit}.`,
      `${prevStock} ${prod.unit}`,
      `${newStock} ${prod.unit}`,
      reason || 'Conteo físico de almacén'
    );
  };

  // Price adjustment with audit log
  const updateProductPrice = (productId: string, newPrice: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const prevPrice = prod.price;
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, price: newPrice } : p)));

    addAuditLog(
      'PRECIO_MODIFICADO',
      prod.name,
      `Modificación de precio de venta: de Bs. ${prevPrice.toFixed(2)} a Bs. ${newPrice.toFixed(2)}.`,
      `Bs. ${prevPrice.toFixed(2)}`,
      `Bs. ${newPrice.toFixed(2)}`,
      reason || 'Actualización de tarifa'
    );
  };

  // Toggle show in POS
  const toggleShowInPOS = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const updated = !p.showInPOS;
          addAuditLog(
            'STOCK_AJUSTADO',
            p.name,
            `Visibilidad en POS cambiada a: ${updated ? 'Visible' : 'Oculto al cajero'}`
          );
          return { ...p, showInPOS: updated };
        }
        return p;
      })
    );
  };

  // Table Management
  const saveOrderToTable = (tableId: string, items: CartItem[], notes?: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
              ...t,
              status: 'OCUPADO',
              currentSale: {
                openedAt: t.currentSale?.openedAt || new Date().toISOString(),
                items,
                notes: notes || t.currentSale?.notes,
              },
            }
          : t
      )
    );
  };

  const markTableForPayment = (tableId: string) => {
    setTables(prev => prev.map(t => (t.id === tableId ? { ...t, status: 'POR_COBRAR' } : t)));
  };

  const clearTable = (tableId: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
              ...t,
              status: 'LIBRE',
              currentSale: undefined,
              combinedWith: undefined,
            }
          : t
      )
    );
  };

  const transferTable = (fromTableId: string, toTableId: string): { success: boolean; message: string } => {
    const source = tables.find(t => t.id === fromTableId);
    const target = tables.find(t => t.id === toTableId);

    if (!source || !target) {
      return { success: false, message: 'Mesas no encontradas.' };
    }
    if (!source.currentSale || source.currentSale.items.length === 0) {
      return { success: false, message: 'La mesa de origen no tiene una comanda activa.' };
    }
    if (target.status !== 'LIBRE') {
      return { success: false, message: `La ${target.name} ya se encuentra ocupada.` };
    }

    setTables(prev =>
      prev.map(t => {
        if (t.id === fromTableId) {
          return { ...t, status: 'LIBRE', currentSale: undefined };
        }
        if (t.id === toTableId) {
          return { ...t, status: 'OCUPADO', currentSale: source.currentSale };
        }
        return t;
      })
    );

    addAuditLog(
      'MESA_TRANSFERIDA',
      `${source.name} -> ${target.name}`,
      `Transferencia de comanda con ${source.currentSale.items.length} productos de ${source.name} a ${target.name}.`
    );

    return { success: true, message: `Comanda transferida con éxito a ${target.name}.` };
  };

  const combineTables = (primaryTableId: string, secondaryTableId: string): { success: boolean; message: string } => {
    const primary = tables.find(t => t.id === primaryTableId);
    const secondary = tables.find(t => t.id === secondaryTableId);

    if (!primary || !secondary) {
      return { success: false, message: 'Mesas no encontradas.' };
    }

    const secondaryItems = secondary.currentSale?.items || [];
    const primaryItems = primary.currentSale?.items || [];

    // Merge items
    const mergedMap = new Map<string, CartItem>();
    [...primaryItems, ...secondaryItems].forEach(item => {
      const existing = mergedMap.get(item.product.id);
      if (existing) {
        existing.quantity += item.quantity;
        if (item.notes) {
          existing.notes = existing.notes ? `${existing.notes}; ${item.notes}` : item.notes;
        }
      } else {
        mergedMap.set(item.product.id, { ...item });
      }
    });

    const combinedList = Array.from(mergedMap.values());

    setTables(prev =>
      prev.map(t => {
        if (t.id === primaryTableId) {
          return {
            ...t,
            status: 'OCUPADO',
            currentSale: {
              openedAt: primary.currentSale?.openedAt || new Date().toISOString(),
              items: combinedList,
              notes: `Mesa combinada con ${secondary.name}`,
            },
            combinedWith: [...(t.combinedWith || []), secondary.number],
          };
        }
        if (t.id === secondaryTableId) {
          return {
            ...t,
            status: 'LIBRE',
            currentSale: undefined,
          };
        }
        return t;
      })
    );

    addAuditLog(
      'MESA_COMBINADA',
      `${primary.name} + ${secondary.name}`,
      `Mesas combinadas. La cuenta se unificó en ${primary.name}. ${secondary.name} quedó libre.`
    );

    return { success: true, message: `Mesas unificadas exitosamente en ${primary.name}.` };
  };

  // Cash Register Actions
  const openCashSession = (initialCash: number, openedBy: string) => {
    const newSession: CashSession = {
      id: `cash-sess-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy,
      initialCash,
      isOpen: true,
      cashSales: 0,
      debtRepaymentsInCash: 0,
      cashExpenses: 0,
      genericPurchasesInCash: 0,
      expectedCash: initialCash,
    };
    setCashSession(newSession);

    addAuditLog(
      'APERTURA_CAJA',
      'Caja Principal',
      `Apertura de turno de caja con fondo inicial de Bs. ${initialCash.toFixed(2)} por ${openedBy}.`,
      'Caja Cerrada',
      `Fondo: Bs. ${initialCash.toFixed(2)}`
    );
  };

  const closeCashSession = (countedCash: number, notes?: string) => {
    const diff = countedCash - cashSession.expectedCash;
    const updated: CashSession = {
      ...cashSession,
      isOpen: false,
      closedAt: new Date().toISOString(),
      closedBy: currentUser,
      actualCashCounted: countedCash,
      difference: diff,
      closureNotes: notes,
    };
    setCashSession(updated);

    const resultLabel =
      diff === 0
        ? 'Caja Exacta (Cuadrada)'
        : diff > 0
        ? `Sobrante de Bs. ${diff.toFixed(2)}`
        : `Faltante de Bs. ${Math.abs(diff).toFixed(2)}`;

    // Save closing to permanent history
    const newClosing: CashClosingHistory = {
      id: `close-${Date.now()}`,
      sessionCode: `TURNO-${new Date().toISOString().split('T')[0]}-T1`,
      openedAt: cashSession.openedAt,
      closedAt: new Date().toISOString(),
      openedBy: cashSession.openedBy,
      closedBy: currentUser,
      initialCash: cashSession.initialCash,
      cashSales: cashSession.cashSales,
      debtRepaymentsInCash: cashSession.debtRepaymentsInCash,
      walletRechargesInCash: 0,
      cashExpenses: cashSession.cashExpenses,
      genericPurchasesInCash: cashSession.genericPurchasesInCash,
      expectedCash: cashSession.expectedCash,
      actualCashCounted: countedCash,
      difference: diff,
      status: diff === 0 ? 'CUADRADA' : diff > 0 ? 'SOBRANTE' : 'FALTANTE',
      notes,
    };
    setCashClosings(prev => [newClosing, ...prev]);

    addAuditLog(
      'CIERRE_CAJA',
      'Caja Principal',
      `Cierre y Arqueo de Caja. Efectivo contado: Bs. ${countedCash.toFixed(2)}, Esperado: Bs. ${cashSession.expectedCash.toFixed(2)}. Resultado: ${resultLabel}.`,
      `Esperado: Bs. ${cashSession.expectedCash.toFixed(2)}`,
      `Real: Bs. ${countedCash.toFixed(2)}`,
      notes || 'Cierre de jornada'
    );
  };

  // Hold Orders (Ventas en Espera F9)
  const saveHoldOrder = (
    customerName: string,
    items: CartItem[],
    notes?: string,
    tableNumber?: string | null
  ): HoldOrder => {
    const total = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const holdOrder: HoldOrder = {
      id: `hold-${Date.now()}`,
      ticketNumber: `ESP-${(holdOrders.length + 1).toString().padStart(3, '0')}`,
      customerName: customerName.trim() || 'Cliente en Espera',
      openedAt: new Date().toISOString(),
      items,
      tableNumber,
      notes,
      total,
    };
    setHoldOrders(prev => [holdOrder, ...prev]);
    addAuditLog(
      'STOCK_AJUSTADO',
      holdOrder.ticketNumber,
      `Venta puesta en espera para "${holdOrder.customerName}" (${items.length} productos, total Bs. ${total.toFixed(2)}).`
    );
    return holdOrder;
  };

  const resumeHoldOrder = (orderId: string): HoldOrder | undefined => {
    const order = holdOrders.find(o => o.id === orderId);
    if (order) {
      setHoldOrders(prev => prev.filter(o => o.id !== orderId));
      addAuditLog(
        'STOCK_AJUSTADO',
        order.ticketNumber,
        `Venta en espera ${order.ticketNumber} recuperada al carrito de ventas.`
      );
    }
    return order;
  };

  const deleteHoldOrder = (orderId: string) => {
    setHoldOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Suppliers & Replenishment
  const registerSupplierPurchase = (purchase: Omit<SupplierPurchase, 'id'>) => {
    const newPurchase: SupplierPurchase = {
      ...purchase,
      id: `sp-${Date.now()}`,
    };

    setSupplierPurchases(prev => [newPurchase, ...prev]);

    // Increase product stocks
    setProducts(prevProducts => {
      const updated = [...prevProducts];
      for (const item of purchase.items) {
        const idx = updated.findIndex(p => p.id === item.productId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            stock: parseFloat((updated[idx].stock + item.quantity).toFixed(3)),
            costPrice: item.unitCost,
          };
        }
      }
      return updated;
    });

    if (purchase.paymentType === 'CONTADO') {
      setCashSession(prev => ({
        ...prev,
        genericPurchasesInCash: prev.genericPurchasesInCash + purchase.total,
        expectedCash: prev.expectedCash - purchase.total,
      }));
    } else {
      setSuppliers(prev =>
        prev.map(s =>
          s.id === purchase.supplierId
            ? { ...s, balancePayable: s.balancePayable + purchase.total, purchasesCount: s.purchasesCount + 1 }
            : s
        )
      );
    }

    addAuditLog(
      'COMPRA_PROVEEDOR',
      purchase.supplierName,
      `Compra de inventario por Bs. ${purchase.total.toFixed(2)} (${purchase.paymentType}). ${purchase.items.length} insumos reabastecidos.`,
      undefined,
      `+Bs. ${purchase.total.toFixed(2)}`,
      purchase.notes || 'Reabastecimiento regular'
    );
  };

  // Inventory Waste / Mermas
  const registerInventoryWaste = (productId: string, quantity: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod || quantity <= 0) return;

    const costLoss = parseFloat((prod.costPrice * quantity).toFixed(2));
    const newWaste: InventoryWaste = {
      id: `wst-${Date.now()}`,
      date: new Date().toISOString(),
      productId,
      productName: prod.name,
      quantity,
      unit: prod.unit,
      reason,
      costLoss,
      registeredBy: currentUser,
    };

    setInventoryWastes(prev => [newWaste, ...prev]);

    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, stock: Math.max(0, parseFloat((p.stock - quantity).toFixed(3))) }
          : p
      )
    );

    addAuditLog(
      'MERMA_REGISTRADA',
      prod.name,
      `Merma/desperdicio registrado: -${quantity} ${prod.unit}. Pérdida valorada: Bs. ${costLoss.toFixed(2)}. Motivo: ${reason}.`,
      `${prod.stock} ${prod.unit}`,
      `${Math.max(0, prod.stock - quantity)} ${prod.unit}`,
      reason
    );
  };

  // Role Authentication Action
  const switchUserRole = (targetRole: UserRole, pin?: string): { success: boolean; message: string } => {
    if (targetRole === 'DUEÑO') {
      const ownerUser = users.find(u => u.role === 'DUEÑO');
      const requiredPin = ownerUser?.pin || '1234';
      if (pin !== requiredPin) {
        return { success: false, message: 'PIN de Administrador/Dueño incorrecto. Acceso restringido.' };
      }
    }
    setCurrentUserRole(targetRole);
    localStorage.setItem(`${STORAGE_PREFIX}userRole`, targetRole);
    addAuditLog(
      'STOCK_AJUSTADO',
      'Control de Acceso',
      `Cambio de sesión a perfil: ${targetRole} (${targetRole === 'DUEÑO' ? 'Acceso Total al Panel Web Empresarial' : 'Operador POS Restringido'})`
    );
    return {
      success: true,
      message: `Sesión iniciada como ${targetRole === 'DUEÑO' ? 'Miriam Suárez (Dueña)' : 'Cajero de Turno'}.`,
    };
  };

  // Recipe Escandallo Editor (Airontium free units)
  const updateProductRecipe = (
    productId: string,
    recipe: RecipeIngredient[],
    updatedCostPrice?: number
  ) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    let computedCost = 0;
    for (const ing of recipe) {
      const ingProd = products.find(p => p.id === ing.productId);
      if (ingProd) {
        computedCost += calculateIngredientCost(ingProd.unit, ingProd.costPrice, ing.quantity, ing.unit);
      }
    }

    const finalCost =
      updatedCostPrice !== undefined ? updatedCostPrice : parseFloat(computedCost.toFixed(2));

    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              recipe,
              costPrice: finalCost,
            }
          : p
      )
    );

    addAuditLog(
      'RECETA_MODIFICADA',
      prod.name,
      `Escandallo/receta modificada para ${prod.name}. Ingredientes: ${recipe.length}. Nuevo costo unitario calculado: Bs. ${finalCost.toFixed(2)}.`,
      `Bs. ${prod.costPrice.toFixed(2)}`,
      `Bs. ${finalCost.toFixed(2)}`,
      'Ajuste técnico de escandallo por el Dueño'
    );
  };

  // Product CRUD (Owner Enterprise Management)
  const createProduct = (productData: Omit<Product, 'id'>, reason?: string): Product => {
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newProd: Product = {
      ...productData,
      id: newId,
    };

    setProducts(prev => [newProd, ...prev]);

    addAuditLog(
      'STOCK_AJUSTADO',
      newProd.name,
      `Producto/Insumo nuevo creado en sistema. Código: ${newProd.code}, Categoría: ${newProd.category}, Precio: Bs. ${newProd.price.toFixed(2)}, Costo: Bs. ${newProd.costPrice.toFixed(2)}, Unidad: ${newProd.unit}, POS: ${newProd.showInPOS ? 'Visible' : 'Oculto a cajero'}.`,
      '-',
      `${newProd.stock} ${newProd.unit}`,
      reason || 'Alta de producto por el Dueño'
    );

    return newProd;
  };

  const updateProduct = (updatedProduct: Product, reason: string) => {
    const prev = products.find(p => p.id === updatedProduct.id);
    if (!prev) return;

    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );

    addAuditLog(
      'PRECIO_MODIFICADO',
      updatedProduct.name,
      `Actualización integral de producto: Precio Bs. ${prev.price.toFixed(2)} -> Bs. ${updatedProduct.price.toFixed(2)}, Costo Bs. ${prev.costPrice.toFixed(2)} -> Bs. ${updatedProduct.costPrice.toFixed(2)}, Visibilidad POS: ${updatedProduct.showInPOS ? 'Visible' : 'Oculto'}, Unidad: ${updatedProduct.unit}.`,
      `Bs. ${prev.price.toFixed(2)}`,
      `Bs. ${updatedProduct.price.toFixed(2)}`,
      reason || 'Modificación administrativa del Dueño'
    );
  };

  const deleteProduct = (productId: string, reason: string): { success: boolean; message: string } => {
    const target = products.find(p => p.id === productId);
    if (!target) return { success: false, message: 'Producto no encontrado.' };

    const isUsedInRecipe = products.some(p => p.recipe?.some(r => r.productId === productId));
    if (isUsedInRecipe) {
      return {
        success: false,
        message: `No se puede eliminar "${target.name}" porque forma parte de la receta de otros productos preparados. Modifique las recetas primero.`,
      };
    }

    setProducts(prev => prev.filter(p => p.id !== productId));
    addAuditLog(
      'STOCK_AJUSTADO',
      target.name,
      `Producto eliminado del catálogo. Stock final retirado: ${target.stock} ${target.unit}.`,
      `Stock: ${target.stock}`,
      'ELIMINADO',
      reason || 'Baja de producto por Dueño'
    );

    return { success: true, message: `Producto "${target.name}" eliminado correctamente.` };
  };

  // Business Config
  const updateBusinessConfig = (newConfig: BusinessConfig) => {
    setBusinessConfig(newConfig);
    addAuditLog(
      'STOCK_AJUSTADO',
      'Configuración del Negocio',
      `Datos del negocio actualizados (NIT: ${newConfig.nitCi}, Dirección: ${newConfig.address}).`
    );
  };

  const registerGenericPurchase = (description: string, amount: number, receiptNote?: string) => {
    const newPurchase: GenericPurchase = {
      id: `gp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      description,
      amount,
      receiptNote,
      cashierName: currentUser,
    };

    setGenericPurchases(prev => [newPurchase, ...prev]);

    // Deduct cash from register
    setCashSession(prev => ({
      ...prev,
      genericPurchasesInCash: prev.genericPurchasesInCash + amount,
      expectedCash: prev.expectedCash - amount,
    }));

    addAuditLog(
      'COMPRA_GENERICA',
      'Caja Efectivo',
      `Salida de caja por compra genérica de mercado: Bs. ${amount.toFixed(2)}. Motivo: ${description}.`,
      undefined,
      `-Bs. ${amount.toFixed(2)}`,
      receiptNote || 'Mercado informal sin factura'
    );
  };

  const registerCashExpense = (concept: string, amount: number) => {
    const newExpense: CashExpense = {
      id: `ce-${Date.now()}`,
      timestamp: new Date().toISOString(),
      concept,
      amount,
      authorizedBy: currentUser,
    };

    setCashExpenses(prev => [newExpense, ...prev]);

    setCashSession(prev => ({
      ...prev,
      cashExpenses: prev.cashExpenses + amount,
      expectedCash: prev.expectedCash - amount,
    }));

    addAuditLog(
      'GASTO_REGISTRADO',
      'Caja Efectivo',
      `Gasto menor de caja registrado: Bs. ${amount.toFixed(2)}. Concepto: ${concept}.`,
      undefined,
      `-Bs. ${amount.toFixed(2)}`
    );
  };

  // Client Debt Repayment (Abono a Fiado)
  const registerClientAbono = (clientId: string, amount: number, method: 'EFECTIVO' | 'QR', notes?: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newDebt = Math.max(0, client.currentDebt - amount);

    setClients(prev =>
      prev.map(c =>
        c.id === clientId
          ? {
              ...c,
              currentDebt: newDebt,
              debtHistory: [
                ...c.debtHistory,
                {
                  id: `dh-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  concept: `Abono de fiado (${method}) - ${notes || 'Pago en ventanilla'}`,
                  amount,
                  type: 'ABONO',
                  balanceAfter: newDebt,
                },
              ],
            }
          : c
      )
    );

    if (method === 'EFECTIVO') {
      setCashSession(prev => ({
        ...prev,
        debtRepaymentsInCash: prev.debtRepaymentsInCash + amount,
        expectedCash: prev.expectedCash + amount,
      }));
    }

    addAuditLog(
      'ABONO_FIADO',
      client.name,
      `Abono de deuda por Bs. ${amount.toFixed(2)} (${method}). Saldo anterior: Bs. ${client.currentDebt.toFixed(
        2
      )}, Nuevo saldo: Bs. ${newDebt.toFixed(2)}.`,
      `Bs. ${client.currentDebt.toFixed(2)}`,
      `Bs. ${newDebt.toFixed(2)}`,
      notes || 'Abono voluntario de cliente'
    );
  };

  // Client Wallet Recharge (Monedero / Saldo a Favor)
  const rechargeClientWallet = (clientId: string, amount: number, method: 'EFECTIVO' | 'QR', notes?: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || amount <= 0) return;

    const newWallet = client.walletBalance + amount;

    setClients(prev =>
      prev.map(c =>
        c.id === clientId
          ? {
              ...c,
              walletBalance: newWallet,
              debtHistory: [
                ...c.debtHistory,
                {
                  id: `dh-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  concept: `Recarga de Monedero (${method}) - ${notes || 'Abono anticipado a favor'}`,
                  amount,
                  type: 'MONEDERO_RECARGA',
                  balanceAfter: c.currentDebt,
                },
              ],
            }
          : c
      )
    );

    if (method === 'EFECTIVO') {
      setCashSession(prev => ({
        ...prev,
        debtRepaymentsInCash: prev.debtRepaymentsInCash + amount,
        expectedCash: prev.expectedCash + amount,
      }));
    }

    addAuditLog(
      'RECARGA_MONEDERO',
      client.name,
      `Recarga de saldo a favor en monedero por Bs. ${amount.toFixed(2)} (${method}). Saldo disponible: Bs. ${newWallet.toFixed(2)}.`,
      `Bs. ${client.walletBalance.toFixed(2)}`,
      `Bs. ${newWallet.toFixed(2)}`,
      notes || 'Abono a monedero'
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        tables,
        cashSession,
        genericPurchases,
        cashExpenses,
        clients,
        suppliers,
        supplierPurchases,
        inventoryWastes,
        cashClosings,
        holdOrders,
        businessConfig,
        auditLogs,
        sales,
        outbox,
        seniorMode,
        darkMode,
        currentUser,
        currentUserRole,
        currentUserObj,
        users,
        switchUserRole,
        isOnline,
        shortcuts,
        toggleSeniorMode,
        toggleDarkMode,
        toggleOnlineStatus,
        syncOutboxNow,
        updateShortcut,
        resetShortcutsToDefault,
        updateBusinessConfig,
        completeSale,
        saveHoldOrder,
        resumeHoldOrder,
        deleteHoldOrder,
        calculateVirtualStock,
        produceBatch,
        unpackPackage,
        updateProductStockManual,
        updateProductPrice,
        updateProductRecipe,
        registerInventoryWaste,
        toggleShowInPOS,
        createProduct,
        updateProduct,
        deleteProduct,
        saveOrderToTable,
        markTableForPayment,
        clearTable,
        transferTable,
        combineTables,
        openCashSession,
        closeCashSession,
        registerGenericPurchase,
        registerCashExpense,
        registerClientAbono,
        rechargeClientWallet,
        registerSupplierPurchase,
        addAuditLog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
