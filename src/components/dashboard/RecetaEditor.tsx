import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, RecipeIngredient } from '../../types';
import { SYSTEM_UNITS, calculateIngredientCost, convertUnit } from '../../utils/unitConversion';
import {
  ChefHat,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
  Sliders,
  DollarSign,
  TrendingUp,
  X,
  Search,
} from 'lucide-react';

export interface RecetaEditorProps {
  product: Product;
  onClose: () => void;
  onSaved?: (updatedProduct: Product) => void;
}

interface BottleneckInfo {
  name: string;
  availableStock: number;
  unit: string;
  servings: number;
}

export const RecetaEditor: React.FC<RecetaEditorProps> = ({
  product,
  onClose,
  onSaved,
}) => {
  const { products, updateProductRecipe, updateProductPrice } = useStore();

  // Recipe ingredients state (deep clone)
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(() => {
    return product.recipe ? JSON.parse(JSON.stringify(product.recipe)) : [];
  });

  const [sellingPrice, setSellingPrice] = useState<number>(product.price);
  const [auditReason, setAuditReason] = useState<string>(
    'Actualización de escandallo técnico y gramaje por el Dueño'
  );
  const [ingredientSearch, setIngredientSearch] = useState<string>('');
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(65); // Default 65% target margin

  // Candidate raw materials and multi-role products available in catalog
  const availableCandidates = useMemo(() => {
    return products.filter(p => {
      const isRawOrUsable =
        p.category === 'INSUMO_CRUDO' ||
        p.canBeUsedAsIngredient ||
        p.category === 'CONGELADO_LOTE' ||
        p.category === 'ARTICULO_TIENDA';
      const isNotSelf = p.id !== product.id;
      const matchesSearch =
        ingredientSearch.trim() === '' ||
        p.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(ingredientSearch.toLowerCase());
      return isRawOrUsable && isNotSelf && matchesSearch;
    });
  }, [products, product.id, ingredientSearch]);

  // Add an ingredient to recipe
  const handleAddIngredient = (rawProd: Product) => {
    // Default unit: if raw is kg -> default to g for convenience, if L -> default to ml, otherwise raw.unit
    let defaultRecipeUnit = rawProd.unit;
    let defaultQty = 1;
    if (rawProd.unit === 'kg') {
      defaultRecipeUnit = 'g';
      defaultQty = 150;
    } else if (rawProd.unit === 'L') {
      defaultRecipeUnit = 'ml';
      defaultQty = 50;
    }

    setIngredients(prev => [
      ...prev,
      {
        productId: rawProd.id,
        productName: rawProd.name,
        quantity: defaultQty,
        unit: defaultRecipeUnit,
      },
    ]);
    setShowAddMenu(false);
    setIngredientSearch('');
  };

  // Remove an ingredient
  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update specific ingredient row
  const handleUpdateIngredient = (
    index: number,
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    setIngredients(prev => {
      const updated = [...prev];
      if (field === 'productId') {
        const found = products.find(p => p.id === value);
        if (found) {
          updated[index] = {
            ...updated[index],
            productId: found.id,
            productName: found.name,
            unit: found.unit === 'kg' ? 'g' : found.unit === 'L' ? 'ml' : found.unit,
          };
        }
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return updated;
    });
  };

  // Calculate live financial escandallo
  const { totalProductionCost, ingredientBreakdown, bottleneckIngredient, maxServingsPossible } =
    useMemo<{
      totalProductionCost: number;
      ingredientBreakdown: Array<
        RecipeIngredient & {
          rawStock: number;
          rawUnit: string;
          rawCost: number;
          convertedQuantity: number;
          costContribution: number;
          servingsAvailable: number;
        }
      >;
      bottleneckIngredient: BottleneckInfo | null;
      maxServingsPossible: number;
    }>(() => {
      let totalCost = 0;
      let minServings = Infinity;
      let bottleneck: BottleneckInfo | null = null;

      const breakdown = ingredients.map(item => {
        const rawProd = products.find(p => p.id === item.productId);
        if (!rawProd) {
          return {
            ...item,
            rawStock: 0,
            rawUnit: item.unit,
            rawCost: 0,
            convertedQuantity: item.quantity,
            costContribution: 0,
            servingsAvailable: 0,
          };
        }

        // Mathematical conversion to raw stock unit
        const convertedQuantity = convertUnit(item.quantity, item.unit, rawProd.unit);
        const costContribution = calculateIngredientCost(
          rawProd.unit,
          rawProd.costPrice,
          item.quantity,
          item.unit
        );
        totalCost += costContribution;

        // Servings check
        let servings = 0;
        if (convertedQuantity > 0) {
          servings = Math.max(0, Math.floor(rawProd.stock / convertedQuantity));
          if (servings < minServings) {
            minServings = servings;
            bottleneck = {
              name: rawProd.name,
              availableStock: rawProd.stock,
              unit: rawProd.unit,
              servings,
            };
          }
        }

        return {
          ...item,
          rawStock: rawProd.stock,
          rawUnit: rawProd.unit,
          rawCost: rawProd.costPrice,
          convertedQuantity,
          costContribution,
          servingsAvailable: servings,
        };
      });

      return {
        totalProductionCost: parseFloat(totalCost.toFixed(2)),
        ingredientBreakdown: breakdown,
        bottleneckIngredient: bottleneck,
        maxServingsPossible: minServings === Infinity ? 0 : minServings,
      };
    }, [ingredients, products]);

  // Gross profit & margin calculations
  const grossProfit = Math.max(0, sellingPrice - totalProductionCost);
  const currentMarginPercent =
    sellingPrice > 0 ? ((grossProfit / sellingPrice) * 100).toFixed(1) : '0.0';

  // Suggested price based on target margin slider
  const suggestedSellingPrice = useMemo(() => {
    if (targetMarginPercent >= 100 || totalProductionCost <= 0) return totalProductionCost;
    const price = totalProductionCost / (1 - targetMarginPercent / 100);
    return Math.ceil(price); // Round up to clean commercial currency
  }, [totalProductionCost, targetMarginPercent]);

  // Save changes
  const handleSaveAll = () => {
    if (ingredients.length === 0) {
      const confirmEmpty = window.confirm(
        'La receta no tiene insumos configurados. ¿Desea guardarla vacía?'
      );
      if (!confirmEmpty) return;
    }

    // 1. Update recipe and calculated cost price
    updateProductRecipe(product.id, ingredients, totalProductionCost);

    // 2. If selling price was adjusted, update selling price with audit
    if (sellingPrice !== product.price) {
      updateProductPrice(
        product.id,
        sellingPrice,
        auditReason || 'Ajuste de precio sugerido por nuevo escandallo'
      );
    }

    const updatedProduct: Product = {
      ...product,
      recipe: ingredients,
      costPrice: totalProductionCost,
      price: sellingPrice,
    };

    if (onSaved) {
      onSaved(updatedProduct);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Editor de Escandallo y Receta Libre
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Airontium Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plato Preparado: <strong className="text-white">{product.name}</strong> ({product.code})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="px-6 py-2.5 bg-emerald-950/40 border-b border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Descuento Atómico en Tiempo Real:</strong> Cada vez que se cobre 1 porción en el POS, el motor descontará automáticamente del stock local de SQLite los insumos en las cantidades y unidades configuradas abajo, realizando las conversiones matemáticas exactas.
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Top Insumos Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                Insumos Asociados ({ingredients.length})
              </span>
              <span className="text-[11px] text-slate-400">
                • Defina cantidades exactas consumidas por porción
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Asociar Insumo / Materia Prima</span>
              </button>

              {/* Insumo Dropdown Picker */}
              {showAddMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 z-30">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar insumo disponible..."
                      value={ingredientSearch}
                      onChange={e => setIngredientSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {availableCandidates.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No se encontraron insumos disponibles.
                      </div>
                    ) : (
                      availableCandidates.map(raw => (
                        <button
                          key={raw.id}
                          type="button"
                          onClick={() => handleAddIngredient(raw)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-700/80 transition flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{raw.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Stock: {raw.stock} {raw.unit} • Bs. {raw.costPrice.toFixed(2)}/{raw.unit}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-amber-400 shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Insumos List Table */}
          {ingredients.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <ChefHat className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-300">Receta sin insumos configurados</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Para que el sistema descuente ingredientes automáticamente y calcule el costo de producción, agregue insumos haciendo clic en <strong>"+ Asociar Insumo / Materia Prima"</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ingredientBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center gap-3 shadow-xs hover:border-slate-600 transition"
                >
                  {/* Insumo Name & Stock info */}
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.productName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-700 text-slate-300 font-mono">
                        Almacén: {item.rawStock} {item.rawUnit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Costo en almacén: Bs. {item.rawCost.toFixed(2)} por {item.rawUnit}
                    </div>
                  </div>

                  {/* Quantity input */}
                  <div className="w-24">
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.001"
                      value={item.quantity}
                      onChange={e =>
                        handleUpdateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono font-bold focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  {/* Free Unit Selector (g, ml, un, kg, etc.) */}
                  <div className="w-32">
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">
                      Unidad Libre
                    </label>
                    <select
                      value={item.unit}
                      onChange={e => handleUpdateIngredient(idx, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-amber-500"
                    >
                      <optgroup label="Masa">
                        <option value="g">Gramos (g)</option>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="lb">Libras (lb)</option>
                        <option value="oz">Onzas (oz)</option>
                      </optgroup>
                      <optgroup label="Volumen">
                        <option value="ml">Mililitros (ml)</option>
                        <option value="L">Litros (L)</option>
                      </optgroup>
                      <optgroup label="Discretas">
                        <option value="un">Unidad (un)</option>
                        <option value="caja">Caja</option>
                        <option value="paquete">Paquete</option>
                        <option value="porcion">Porción</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Deduction & Cost Summary */}
                  <div className="w-36 text-right">
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">
                      Bs. {item.costContribution.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono" title="Equivalencia en unidad de almacén">
                      = {item.convertedQuantity.toFixed(3)} {item.rawUnit}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                    title="Eliminar insumo de la receta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottleneck & Virtual Stock Indicator */}
          {ingredients.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Capacidad Actual de Preparación:{' '}
                    <span className="text-cyan-400 font-mono text-sm font-black">
                      {maxServingsPossible} porciones disponibles
                    </span>
                  </div>
                  {bottleneckIngredient && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ingrediente limitante (Cuello de botella):{' '}
                      <strong className="text-amber-400">{bottleneckIngredient.name}</strong> (Solo quedan{' '}
                      {bottleneckIngredient.availableStock} {bottleneckIngredient.unit} para{' '}
                      {bottleneckIngredient.servings} porciones).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Financial Escandallo & Margin Simulator */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Simulador de Precios y Margen de Rentabilidad</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Costo de Producción */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  Costo de Insumos (Escandallo):
                </span>
                <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                  Bs. {totalProductionCost.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Suma ponderada de materia prima
                </span>
              </div>

              {/* Precio de Venta al Público */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  Precio de Venta al Público:
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm font-mono text-slate-400 font-bold">Bs.</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-2xl font-black font-mono text-emerald-400 bg-transparent border-b border-emerald-500/50 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Editable directamente aquí
                </span>
              </div>

              {/* Margen Bruto Real */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700">
                <span className="text-[11px] text-slate-400 block font-semibold">
                  Margen Bruto Proyectado:
                </span>
                <span className="text-2xl font-black font-mono text-white mt-1 block">
                  {currentMarginPercent}%
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
                  Ganancia: +Bs. {grossProfit.toFixed(2)} / porción
                </span>
              </div>
            </div>

            {/* Target Margin Slider */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 font-medium">Margen deseado:</span>
                <input
                  type="range"
                  min="20"
                  max="85"
                  step="5"
                  value={targetMarginPercent}
                  onChange={e => setTargetMarginPercent(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-white w-10">{targetMarginPercent}%</span>
              </div>

              <button
                type="button"
                onClick={() => setSellingPrice(suggestedSellingPrice)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold cursor-pointer transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Aplicar Precio Sugerido: Bs. {suggestedSellingPrice.toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Mandatory Forensic Audit Reason */}
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1">
              Motivo / Justificación para la Auditoría Forense (Obligatorio)
            </label>
            <input
              type="text"
              required
              value={auditReason}
              onChange={e => setAuditReason(e.target.value)}
              placeholder="Ej. Actualización de gramajes por ajuste de receta gastronómica..."
              className="w-full px-3 py-2 bg-slate-800 border border-amber-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Guardar Receta y Actualizar Costo (Bs. {totalProductionCost.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
