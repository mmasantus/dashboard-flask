import React from 'react';
import { Sparkles, Users, RotateCcw, FileText } from 'lucide-react';

interface HeaderProps {
  hasData: boolean;
  onLoadDemo: () => void;
  onClearData: () => void;
  onOpenAtendentes: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasData,
  onLoadDemo,
  onClearData,
  onOpenAtendentes,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-950/40 border border-emerald-500/30 flex items-center justify-center bg-emerald-600 shrink-0">
            <img
              src="/assets/aistudio/icone_a11907dc.jpg"
              alt="MKTZAP WhatsApp Icon"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback icon in case image is inaccessible
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white truncate">
                Passagem de Turno MKTZAP
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                v2.0 Analytics
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate hidden md:block">
              Consolidação de canais Whats GN, GV, Franquia & CB Commerce
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="Carregar dados de exemplo para testar métricas e exportação Word"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Carregar</span> Exemplo
          </button>

          <button
            type="button"
            onClick={onOpenAtendentes}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-300 hover:text-white bg-blue-950/50 hover:bg-blue-900/60 border border-blue-600/40 rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-blue-900/20 cursor-pointer"
            title="Equipe Experiência Brasil - Administrador: Marcio Miranda (Acesso Restrito)"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Equipe</span> Experiência Brasil
            <span className="px-1.5 py-0.2 bg-blue-500/20 text-[10px] text-blue-300 rounded font-mono">Admin</span>
          </button>

          {hasData && (
            <button
              type="button"
              onClick={onClearData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors whitespace-nowrap"
              title="Limpar relatório atual e carregar novo arquivo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
