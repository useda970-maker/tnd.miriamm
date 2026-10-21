import { UnitDefinition } from '../types';

export const SYSTEM_UNITS: UnitDefinition[] = [
  // Masa
  { code: 'kg', name: 'Kilogramos (kg)', type: 'MASA', baseFactor: 1000 },
  { code: 'g', name: 'Gramos (g)', type: 'MASA', baseFactor: 1 },
  { code: 'lb', name: 'Libras (lb)', type: 'MASA', baseFactor: 453.59237 },
  { code: 'oz', name: 'Onzas (oz)', type: 'MASA', baseFactor: 28.34952 },

  // Volumen
  { code: 'L', name: 'Litros (L)', type: 'VOLUMEN', baseFactor: 1000 },
  { code: 'ml', name: 'Mililitros (ml)', type: 'VOLUMEN', baseFactor: 1 },

  // Discretas
  { code: 'un', name: 'Unidad (un)', type: 'DISCRETO', baseFactor: 1 },
  { code: 'caja', name: 'Caja', type: 'DISCRETO', baseFactor: 1 },
  { code: 'paquete', name: 'Paquete', type: 'DISCRETO', baseFactor: 1 },
  { code: 'blister', name: 'Blíster', type: 'DISCRETO', baseFactor: 1 },
  { code: 'porcion', name: 'Porción', type: 'DISCRETO', baseFactor: 1 },
];

/**
 * Normaliza el código de unidad (elimina acentos, mayúsculas, etc.)
 */
export function normalizeUnitCode(rawUnit: string): string {
  if (!rawUnit) return 'un';
  const clean = rawUnit.trim().toLowerCase();
  if (clean === 'kg' || clean === 'kilo' || clean === 'kilogramo' || clean === 'kilogramos') return 'kg';
  if (clean === 'g' || clean === 'gr' || clean === 'gramo' || clean === 'gramos') return 'g';
  if (clean === 'lb' || clean === 'libra' || clean === 'libras') return 'lb';
  if (clean === 'oz' || clean === 'onza' || clean === 'onzas') return 'oz';
  if (clean === 'l' || clean === 'lt' || clean === 'litro' || clean === 'litros') return 'L';
  if (clean === 'ml' || clean === 'mililitro' || clean === 'mililitros' || clean === 'cc') return 'ml';
  if (clean === 'un' || clean === 'unidad' || clean === 'unidades' || clean === 'u') return 'un';
  if (clean.includes('caja')) return 'caja';
  if (clean.includes('paquete') || clean.includes('pack')) return 'paquete';
  if (clean.includes('blister') || clean.includes('blíster')) return 'blister';
  if (clean.includes('porcion') || clean.includes('porción')) return 'porcion';
  return clean;
}

/**
 * Convierte una cantidad de `fromUnit` a `toUnit`.
 * Por ejemplo:
 * - 150 g a kg -> 0.15 kg
 * - 1 lb a g -> 453.59 g
 * - 250 ml a L -> 0.25 L
 * Si no son compatibles (ej. kg a L o unidades discretas no mapeadas), devuelve la cantidad original
 */
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  customMultiplier: number = 1
): number {
  const normFrom = normalizeUnitCode(fromUnit);
  const normTo = normalizeUnitCode(toUnit);

  if (normFrom === normTo) return amount;

  const defFrom = SYSTEM_UNITS.find(u => u.code.toLowerCase() === normFrom.toLowerCase());
  const defTo = SYSTEM_UNITS.find(u => u.code.toLowerCase() === normTo.toLowerCase());

  // Si ambas son unidades con tipo conocido y mismo tipo (MASA o VOLUMEN)
  if (defFrom && defTo && defFrom.type === defTo.type) {
    const baseValue = amount * defFrom.baseFactor;
    return baseValue / defTo.baseFactor;
  }

  // Si hay un multiplicador de presentación personalizado (ej. Caja 24 -> Unidad)
  if (customMultiplier > 0) {
    return amount * customMultiplier;
  }

  return amount;
}

/**
 * Calcula el costo de un insumo consumido en una receta, convirtiendo unidades.
 * Ejemplo: Insumo cuesta 32 Bs/kg. Receta usa 150 g.
 * 150 g = 0.15 kg => Costo = 0.15 * 32 = 4.80 Bs.
 */
export function calculateIngredientCost(
  rawStockUnit: string,
  rawCostPrice: number,
  recipeQuantity: number,
  recipeUnit: string
): number {
  const quantityInStockUnit = convertUnit(recipeQuantity, recipeUnit, rawStockUnit);
  return quantityInStockUnit * rawCostPrice;
}
