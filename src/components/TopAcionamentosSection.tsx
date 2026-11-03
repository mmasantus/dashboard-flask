import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Eye, 
  Copy, 
  Download, 
  Search, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { TopAcionamento } from '../types';

interface TopAcionamentosSectionProps {
  topAcionamentos: TopAcionamento[];
  demaisCount: number;
  demaisCasos: number;
  onSelectAcionamento: (item: TopAcionamento) => void;
  onCopyAllTopProtocols: () => void;
  onDownloadAllTopProtocols: () => void;
}

export const TopAcionamentosSection: React.FC<TopAcionamentosSectionProps> = ({
  topAcionamentos,
  onSelectAcionamento,
  onCopyAllTopProtocols,
  onDownloadAllTopProtocols,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const maxQuantidade = topAcionamentos.length > 0 ? topAcionamentos[0].quantidade : 1;

  // Filter if search term is entered
  const filteredItems = searchTerm.trim()
    ? topAcionamentos.filter((item) =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : topAcionamentos;

  // If user searched or expanded, show all filtered items; otherwise show only the Top 3
  const displayedItems = (searchTerm.trim() || isExpanded)
    ? filteredItems
    : filteredItems.slice(0, 3);

  const hasMoreThanThree = topAcionamentos.length > 3;

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) {
      return {
        badgeText: 'text-amber-500 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700/60',
        cardBg: 'bg-white dark:bg-[#111827] border-amber-200/80 dark:border-amber-500/30 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.12)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-amber-400',
        barColor: 'from-amber-400 to-yellow-500',
      };
    }
    if (rank === 2) {
      return {
        badgeText: 'text-slate-600 dark:text-slate-300',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
        cardBg: 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700/60 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-slate-400',
        barColor: 'from-slate-300 to-slate-400',
      };
    }
    if (rank === 3) {
      return {
        badgeText: 'text-amber-700 dark:text-amber-600',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800/60',
        cardBg: 'bg-white dark:bg-[#111726] border-amber-200/70 dark:border-amber-800/40 shadow-[0_2px_8px_-2px_rgba(180,83,9,0.08)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-amber-400',
        barColor: 'from-amber-600 to-amber-700',
      };
    }
    return {
      badgeText: 'text-slate-600 dark:text-slate-400',
      badgeBg: 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700',
      cardBg: 'bg-white dark:bg-[#0d1424] border-slate-200/90 dark:border-slate-800/90 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_3px_12px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-slate-300 dark:hover:border-slate-700',
      barColor: 'from-emerald-500 to-teal-500',
    };
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden flex flex-col justify-between h-full transition-all">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0f1728]/40">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Top Acionamentos (Função do Sistema)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isExpanded
              ? 'Exibindo todos os motivos registrados no turno'
              : 'Exibindo os 3 principais motivos do turno'}
          </p>
        </div>

        {/* Badges and actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {topAcionamentos.length > 0 && (
            <button
              type="button"
              onClick={onCopyAllTopProtocols}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              title="Copiar todos os protocolos agrupados"
            >
              <Copy className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span>Copiar Todos</span>
            </button>
          )}

          {/* Toggle Maximizar / Minimizar Button in Header */}
          {hasMoreThanThree && !searchTerm && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-sm cursor-pointer"
              title={isExpanded ? 'Minimizar para ver os 3 primeiros' : 'Maximizar para ver mais acionamentos'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3 h-3 text-emerald-500" />
                  <span>Minimizar (Top 3)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3 text-blue-500" />
                  <span>Maximizar (+{topAcionamentos.length - 3})</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg shrink-0">
            <Award className="w-3.5 h-3.5" />
            <span className="font-semibold whitespace-nowrap">
              {isExpanded ? `${topAcionamentos.length} Motivos` : `Top 3 de ${topAcionamentos.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Search filter (when expanded or more than 5 items) */}
      {(isExpanded || topAcionamentos.length > 5) && (
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar motivos por nome..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Content: List of acionamentos */}
      <div className="p-5 flex-1 flex flex-col justify-start">
        {topAcionamentos.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Nenhum acionamento registrado na planilha.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum motivo encontrado com o filtro "{searchTerm}".
          </div>
        ) : (
          <div className={`space-y-3 ${isExpanded ? 'max-h-[500px] overflow-y-auto pr-1' : ''}`}>
            {displayedItems.map((item) => {
              const badge = getRankBadgeStyle(item.rank);
              const relativePercent = maxQuantidade > 0 ? (item.quantidade / maxQuantidade) * 100 : 0;

              return (
                <div
                  key={`${item.rank}-${item.nome}`}
                  onClick={() => onSelectAcionamento(item)}
                  role="button"
                  tabIndex={0}
                  className={`p-3 rounded-xl border ${badge.cardBg} transition-all cursor-pointer hover:shadow-md group relative`}
                  title={`Clique para ver os ${item.quantidade} protocolos deste motivo`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono-numbers shrink-0 ${badge.badgeText} ${badge.badgeBg}`}
                      >
                        {item.rank}º
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        {item.nome}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono-numbers">
                        {item.quantidade}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-numbers">
                        ({item.percentual.toFixed(1)}%)
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/60 px-2 py-0.5 rounded-md group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                        <Eye className="w-3 h-3" />
                        <span>Ver Protocolos</span>
                      </span>
                    </div>
                  </div>

                  {/* Relative bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-950/90 rounded-full h-1.5 overflow-hidden border border-slate-200/80 dark:border-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${badge.barColor} transition-all duration-700`}
                      style={{ width: `${Math.max(4, relativePercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* In-list Expand/Collapse interactive button */}
            {hasMoreThanThree && !searchTerm && (
              <div className="pt-1">
                {!isExpanded ? (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-sm"
                  >
                    <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                    <span>Maximizar para ver mais acionamentos (+{topAcionamentos.length - 3} outros motivos)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Minimizar para ver os 3 primeiros</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-emerald-500" />
          <span>Clique em qualquer acionamento para ver, copiar ou baixar protocolos</span>
        </span>

        {topAcionamentos.length > 0 && (
          <button
            type="button"
            onClick={onDownloadAllTopProtocols}
            className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-colors cursor-pointer"
            title="Baixar arquivo TXT com todos os protocolos registrados"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Baixar Relatório Geral (TXT)</span>
          </button>
        )}
      </div>
    </div>
  );
};
