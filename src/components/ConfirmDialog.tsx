import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`p-2.5 rounded-xl border ${
            isDestructive 
              ? 'bg-red-500/10 border-red-500/20 text-red-500' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-900/80 pt-4">
          <button
            id="confirm-dialog-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-450 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            id="confirm-dialog-submit-btn"
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
              isDestructive
                ? 'bg-red-650 hover:bg-red-600 border border-red-700/30 text-white shadow-red-950/20'
                : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 text-white shadow-emerald-950/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
