import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-slate-300/40 dark:shadow-slate-950/50';
        let Icon = Info;
        let iconColor = 'text-blue-500 dark:text-blue-400';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 dark:border-emerald-600/40 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10 dark:shadow-emerald-950/50';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200 dark:border-rose-600/40 bg-rose-50/95 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100 shadow-rose-500/10 dark:shadow-rose-950/50';
          Icon = AlertCircle;
          iconColor = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 dark:border-amber-600/40 bg-amber-50/95 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 shadow-amber-500/10 dark:shadow-amber-950/50';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600 dark:text-amber-400';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight leading-5">{toast.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg cursor-pointer"
              title="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
