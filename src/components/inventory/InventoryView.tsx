import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import {
  Boxes,
  Plus,
  Snowflake,
  PackageOpen,
  Eye,
  EyeOff,
  Edit2,
  AlertTriangle,
  Layers,
  ChefHat,
  Search,
  Check,
  X,
  History,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    calculateVirtualStock,
    produceBatch,
    unpackPackage,
    updateProductStockManual,
    updateProductPrice,
    toggleShowInPOS,
    seniorMode,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [producingProduct, setProducingProduct] = useState<Product | null>(null);
  const [batchQuantity, setBatchQuantity] = useState<number>(10);
  const [unpackingProduct, setUnpackingProduct] = useState<Product | null>(null);

  // Edit stock modal
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [stockReason, setStockReason] = useState<string>('');

  // Edit price modal
  const [editingPriceProduct, setEditingPriceProduct] = useState<Product | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);
  const [priceReason, setPriceReason] = useState<string>('');

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleProduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!producingProduct) return;

    const res = produceBatch(producingProduct.id, batchQuantity);
    alert(res.message);
    if (res.success) {
      setProducingProduct(null);
    }
  };

  const handleUnpackConfirm = () => {
    if (!unpackingProduct) return;
    const res = unpackPackage(unpackingProduct.id);
    alert(res.message);
    if (res.success) {
      setUnpackingProduct(null);
    }
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStockProduct) return;
    updateProductStockManual(editingStockProduct.id, newStockValue, stockReason);
    setEditingStockProduct(null);
    setStockReason('');
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceProduct) return;
    updateProductPrice(editingPriceProduct.id, newPriceValue, priceReason);
    setEditingPriceProduct(null);
    setPriceReason('');
  };

  const getCategoryBadge = (cat: ProductCategory) => {
    switch (cat) {
      case 'INSUMO_CRUDO':
        return { label: 'Insumo Crudo (Mayorista)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'PREPARADO':
        return { label: 'Preparado (Receta Directa)', color: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'CONGELADO_LOTE':
        return { label: 'Congelado (Por Lote)', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'ARTICULO_TIENDA':
        return { label: 'Artículo Tienda (Reventa)', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'SERVICIO':
        return { label: 'Servicio (Sin Stock)', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-7 h-7 text-emerald-600" />
              <span>Inventario y Clasificación de Productos</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Control de las 5 categorías estrictas, producción por lote, desgloses y doble rol.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Total catálogo: {products.length} productos
            </span>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'INSUMO_CRUDO', label: '1. Insumos Crudos' },
              { id: 'PREPARADO', label: '2. Preparados' },
              { id: 'CONGELADO_LOTE', label: '3. Congelados' },
              { id: 'ARTICULO_TIENDA', label: '4. Tienda' },
              { id: 'SERVICIO', label: '5. Servicios' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Código / Producto</th>
                  <th className="py-3 px-4">Categoría Estricta</th>
                  <th className="py-3 px-4 text-right">Precio Venta</th>
                  <th className="py-3 px-4 text-center">Stock Actual</th>
                  <th className="py-3 px-4 text-center">En POS</th>
                  <th className="py-3 px-4 text-center">Doble Rol</th>
                  <th className="py-3 px-4 text-right">Acciones Especiales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map(product => {
                  const badge = getCategoryBadge(product.category);
                  const virtualStock =
                    product.category === 'PREPARADO' ? calculateVirtualStock(product) : product.stock;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                              style={{ backgroundColor: product.colorTag || '#64748B' }}
                            >
                              {product.code.slice(0, 3)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {product.code} · Costo: Bs. {product.costPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        {/* Recipe hint if prepared */}
                        {product.recipe && product.recipe.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1 max-w-xs">
                            Receta: {product.recipe.map(r => `${r.quantity} ${r.unit} ${r.productName}`).join(' + ')}
                          </div>
                        )}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                            {product.price > 0 ? `Bs. ${product.price.toFixed(2)}` : 'No se vende'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingPriceProduct(product);
                              setNewPriceValue(product.price);
                              setPriceReason('');
                            }}
                            title="Modificar precio de venta (requiere motivo)"
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {product.category === 'SERVICIO' ? (
                            <span className="text-slate-400 font-semibold text-xs">Sin límite</span>
                          ) : product.category === 'PREPARADO' ? (
                            <span
                              className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                                virtualStock < 0
                                  ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70 font-black border border-rose-300 dark:border-rose-800'
                                  : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                              }`}
                            >
                              {virtualStock} platos (Virtual)
                            </span>
                          ) : (
                            <span
                              className={`font-bold font-mono px-2 py-0.5 rounded text-xs tabular-nums ${
                                product.stock < 0
                                  ? 'bg-rose-600 text-white font-black shadow-xs'
                                  : product.stock <= (product.minStockAlert || 5)
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {product.stock} {product.unit}
                            </span>
                          )}

                          {product.category !== 'PREPARADO' && product.category !== 'SERVICIO' && (
                            <button
                              onClick={() => {
                                setEditingStockProduct(product);
                                setNewStockValue(product.stock);
                                setStockReason('');
                              }}
                              title="Ajustar stock físicamente (se audita)"
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Show in POS toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleShowInPOS(product.id)}
                          title={
                            product.showInPOS
                              ? 'Visible en la pantalla del cajero. Clic para ocultar.'
                              : 'Oculto al cajero (útil para insumos crudos). Clic para mostrar.'
                          }
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            product.showInPOS
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {product.showInPOS ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Double role indicator */}
                      <td className="py-3 px-4 text-center">
                        {product.canBeUsedAsIngredient ? (
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200">
                            Sí (Doble Rol)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">No</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Batch production button for Frozen products */}
                          {product.category === 'CONGELADO_LOTE' && (
                            <button
                              onClick={() => {
                                setProducingProduct(product);
                                setBatchQuantity(10);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Producir Lote</span>
                            </button>
                          )}

                          {/* Unpack package button (Desglose) */}
                          {product.unpackTargetId && (
                            <button
                              onClick={() => setUnpackingProduct(product)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <PackageOpen className="w-3.5 h-3.5" />
                              <span>Desglosar Paquete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Produce Batch for Frozen Products */}
        {producingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-purple-600" />
                  <span>Producción de Lote: {producingProduct.name}</span>
                </h3>
                <button
                  onClick={() => setProducingProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Al producir, se sumará stock al congelador y se descontará la carne cruda de forma
                automática.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cantidad a producir ({producingProduct.unit}):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    value={batchQuantity}
                    onChange={e => setBatchQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-base bg-white dark:bg-slate-800"
                  />
                  {[5, 10, 20, 50].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBatchQuantity(qty)}
                      className="px-2.5 py-2 text-xs font-bold rounded-lg border bg-slate-50 dark:bg-slate-800 cursor-pointer"
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Insumos required preview */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                <span className="font-bold text-purple-900 dark:text-purple-200 block">
                  Insumos crudos a descontar del almacén:
                </span>
                {producingProduct.recipe?.map((ing, i) => {
                  const required = ing.quantity * batchQuantity;
                  const availableProd = products.find(p => p.id === ing.productId);
                  const available = availableProd ? availableProd.stock : 0;
                  const hasEnough = available >= required;

                  return (
                    <div key={i} className="flex justify-between items-center py-0.5">
                      <span>{ing.productName}:</span>
                      <span
                        className={`font-mono font-bold ${
                          hasEnough ? 'text-purple-800 dark:text-purple-300' : 'text-rose-600 font-extrabold'
                        }`}
                      >
                        {required.toFixed(2)} {ing.unit} (Disp: {available} {ing.unit})
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProducingProduct(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProduceSubmit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs"
                >
                  Confirmar y Descontar Insumos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Unpack Package (Desglose Paquete -> Individual) */}
        {unpackingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PackageOpen className="w-5 h-5 text-blue-600" />
                  <span>Desglose de Paquete a Individual</span>
                </h3>
                <button
                  onClick={() => setUnpackingProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ¿Abrir 1 {unpackingProduct.unit} de{' '}
                <strong className="text-slate-900 dark:text-white">{unpackingProduct.name}</strong>?
              </p>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-blue-900 dark:text-blue-200">
                  <span>Operación de Almacén:</span>
                  <span>-1 {unpackingProduct.unit}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Se agregarán al inventario individual:</span>
                  <span>+{unpackingProduct.unpackUnitsYield} unidades</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-blue-200">
                  Producto destino: {products.find(p => p.id === unpackingProduct.unpackTargetId)?.name}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnpackingProduct(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUnpackConfirm}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                >
                  Confirmar Desglose
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Stock Manual with mandatory reason */}
        {editingStockProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Ajuste Manual de Inventario (Auditado)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Producto:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {editingStockProduct.name}
                </strong>{' '}
                (Stock actual: {editingStockProduct.stock} {editingStockProduct.unit})
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nuevo Stock Físico ({editingStockProduct.unit}):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newStockValue}
                  onChange={e => setNewStockValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-base bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo obligatorio del cambio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Conteo físico fin de semana, merma por rotura..."
                  value={stockReason}
                  onChange={e => setStockReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStockProduct(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!stockReason.trim()}
                  onClick={handleStockSubmit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white disabled:opacity-50 cursor-pointer"
                >
                  Guardar y Registrar en Auditoría
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Price with mandatory reason */}
        {editingPriceProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <span>Modificar Precio de Venta (Auditado)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Producto:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {editingPriceProduct.name}
                </strong>{' '}
                (Precio actual: Bs. {editingPriceProduct.price.toFixed(2)})
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nuevo Precio de Venta (Bs.):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newPriceValue}
                  onChange={e => setNewPriceValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg font-bold text-base bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo obligatorio del cambio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Aumento de costo de proveedor, promoción..."
                  value={priceReason}
                  onChange={e => setPriceReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPriceProduct(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!priceReason.trim()}
                  onClick={handlePriceSubmit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white disabled:opacity-50 cursor-pointer"
                >
                  Guardar y Registrar en Auditoría
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
