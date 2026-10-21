import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShortcutActionId } from '../../types';
import {
  SHORTCUT_DEFINITIONS,
  COMMON_SHORTCUT_KEYS,
  getNormalizedKeyString,
} from '../../data/shortcuts';
import {
  Keyboard,
  X,
  RotateCcw,
  Check,
  Zap,
  Info,
  AlertTriangle,
  Sliders,
} from 'lucide-react';

interface ShortcutsConfigModalProps {
  onClose: () => void;
}

export const ShortcutsConfigModal: React.FC<ShortcutsConfigModalProps> = ({ onClose }) => {
  const { shortcuts, updateShortcut, resetShortcutsToDefault, seniorMode } = useStore();

  const [recordingActionId, setRecordingActionId] = useState<ShortcutActionId | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Global listener while recording a key press
  useEffect(() => {
    if (!recordingActionId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't record modifier only
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      const keyString = getNormalizedKeyString(e);

      // Check if already in use by another action
      const conflictEntry = Object.entries(shortcuts).find(
        ([id, k]) => id !== recordingActionId && k === keyString
      );

      if (conflictEntry) {
        const conflictingDef = SHORTCUT_DEFINITIONS.find(d => d.id === conflictEntry[0]);
        setConflictWarning(
          `La tecla [${keyString}] ya está asignada a "${conflictingDef?.label || conflictEntry[0]}". Si confirma, se reasignará.`
        );
      } else {
        setConflictWarning(null);
      }

      updateShortcut(recordingActionId, keyString);
      setRecordingActionId(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [recordingActionId, shortcuts, updateShortcut]);

  const handleManualKeySelect = (actionId: ShortcutActionId, key: string) => {
    const conflictEntry = Object.entries(shortcuts).find(
      ([id, k]) => id !== actionId && k === key
    );

    if (conflictEntry) {
      const conflictingDef = SHORTCUT_DEFINITIONS.find(d => d.id === conflictEntry[0]);
      setConflictWarning(
        `Nota: La tecla [${key}] ya la usa "${conflictingDef?.label || conflictEntry[0]}". Se recomienda no duplicar atajos.`
      );
    } else {
      setConflictWarning(null);
    }

    updateShortcut(actionId, key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Atajos de Teclado del POS</h2>
              <p className="text-xs text-slate-300">
                Personalice las teclas de acceso rápido para acelerar la atención diaria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip / Explanation banner for elderly cashiers */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Consejo para cajeros:</strong> Las teclas de función (F1, F2, F3, F4) funcionan
            desde cualquier pantalla del sistema y no interfieren al escribir nombres o números.
          </span>
        </div>

        {/* Conflict Alert if any */}
        {conflictWarning && (
          <div className="px-6 py-2 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{conflictWarning}</span>
            </div>
            <button
              onClick={() => setConflictWarning(null)}
              className="text-xs font-bold hover:underline cursor-pointer"
            >
              Entendido
            </button>
          </div>
        )}

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {SHORTCUT_DEFINITIONS.map(def => {
            const currentKey = shortcuts[def.id] || def.defaultKey;
            const isRecording = recordingActionId === def.id;

            return (
              <div
                key={def.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isRecording
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {def.label}
                    </span>
                    {currentKey === def.defaultKey && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        (Por defecto)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {def.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Key Cap */}
                  <kbd
                    className={`min-w-16 px-3 py-1.5 text-center font-mono font-black text-sm rounded-lg border shadow-xs ${
                      isRecording
                        ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isRecording ? 'Presione tecla...' : currentKey}
                  </kbd>

                  {/* Record button */}
                  <button
                    onClick={() => {
                      setConflictWarning(null);
                      setRecordingActionId(isRecording ? null : def.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isRecording ? 'Cancelar' : 'Capturar'}
                  </button>

                  {/* Dropdown for easy touch/mouse selection */}
                  <select
                    value={currentKey}
                    onChange={e => handleManualKeySelect(def.id, e.target.value)}
                    className="px-2 py-1.5 text-xs font-bold font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                    title="Elegir tecla de la lista"
                  >
                    {COMMON_SHORTCUT_KEYS.map(k => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              resetShortcutsToDefault();
              setConflictWarning(null);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Valores de Fábrica (F1-F10)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Guardar y Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
