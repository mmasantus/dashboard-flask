import React from 'react';
import { Sparkles, Users, RotateCcw, FileText, Sun, Moon, LayoutDashboard, BookOpen } from 'lucide-react';

interface HeaderProps {
  hasData: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'dashboard' | 'como-funciona';
  onSelectTab: (tab: 'dashboard' | 'como-funciona') => void;
  onLoadDemo: () => void;
  onClearData: () => void;
  onOpenAtendentes: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasData,
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
  onLoadDemo,
  onClearData,
  onOpenAtendentes,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-30 transition-colors shadow-xs dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-18 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand Zone with Modern Clean Vector Emblem */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Clean Modern Shift & Communication Vector Emblem */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-500/10 border border-emerald-400/30 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-sky-600 shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" fillOpacity="0.2" />
              <path d="m9 10 2 2 4-4" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Passagem de Turno MKTZAP
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-mono">
                v2.5
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Experiência Brasil
            </p>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Main Navigation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
              <span>Painel</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('como-funciona')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'como-funciona'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Como Funciona</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            title="Carregar dados de exemplo para testar métricas e exportação Word"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Carregar</span> Exemplo
          </button>

          <button
            type="button"
            onClick={onOpenAtendentes}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-600/40 rounded-xl transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            title="Equipe Experiência Brasil - Administrador: Marcio Miranda (Acesso Restrito por Senha)"
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Equipe</span> Experiência Brasil
            <span className="px-1.5 py-0.2 bg-blue-200/60 dark:bg-blue-500/20 text-[10px] text-blue-800 dark:text-blue-300 rounded font-mono">
              Admin
            </span>
          </button>

          {/* Theme Toggle Button (Sol / Lua) - Right beside Limpar */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Limpar Button */}
          {hasData && (
            <button
              type="button"
              onClick={onClearData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-sm"
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
