import React from 'react';
import { Product, ProductPresentation } from '../../types';
import { Layers, X, Check } from 'lucide-react';

interface PresentationModalProps {
  product: Product;
  onSelectPresentation: (presentation: ProductPresentation) => void;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  product,
  onSelectPresentation,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">{product.name}</h3>
              <p className="text-xs text-slate-300">Seleccione la presentación o porción deseada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presentation List */}
        <div className="p-5 space-y-2.5">
          {product.presentations?.map((pres) => (
            <button
              key={pres.id}
              onClick={() => {
                onSelectPresentation(pres);
                onClose();
              }}
              className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 flex items-center justify-between transition-all group cursor-pointer text-left"
            >
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {pres.name}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {pres.multiplier > 1 ? `Equivale a ${pres.multiplier}x porciones base` : 'Presentación estándar'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  Bs. {pres.price.toFixed(2)}
                </span>
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-400 group-hover:text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Seleccionar</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
