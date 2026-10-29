import React from 'react';
import { Trophy, Award, BarChart3, Info, Eye, Copy, Download } from 'lucide-react';
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
  demaisCount,
  demaisCasos,
  onSelectAcionamento,
  onCopyAllTopProtocols,
  onDownloadAllTopProtocols,
}) => {
  const maxQuantidade = topAcionamentos.length > 0 ? topAcionamentos[0].quantidade : 1;

  const medalBadges = [
    { rank: 1, label: '1º Lugar', color: 'from-amber-400 to-yellow-500', text: 'text-amber-400', border: 'border-amber-500/40 hover:border-amber-400/80', bg: 'bg-amber-950/40' },
    { rank: 2, label: '2º Lugar', color: 'from-slate-300 to-slate-400', text: 'text-slate-300', border: 'border-slate-500/40 hover:border-slate-300/80', bg: 'bg-slate-900/60' },
    { rank: 3, label: '3º Lugar', color: 'from-amber-600 to-amber-700', text: 'text-amber-600', border: 'border-amber-700/40 hover:border-amber-500/80', bg: 'bg-amber-950/30' },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top Acionamentos (Função do Sistema)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique em qualquer motivo para ver e copiar os protocolos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {topAcionamentos.length > 0 && (
            <button
              type="button"
              onClick={onCopyAllTopProtocols}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              title="Copiar todos os protocolos do Top 3 agrupados"
            >
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copiar Top 3</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-lg shrink-0">
            <Award className="w-3.5 h-3.5" />
            <span className="font-semibold">Top 3 Oficiais</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        {topAcionamentos.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum acionamento registrado na planilha.
          </div>
        ) : (
          <div className="space-y-4">
            {topAcionamentos.map((item, index) => {
              const badge = medalBadges[index] || medalBadges[0];
              const relativePercent = maxQuantidade > 0 ? (item.quantidade / maxQuantidade) * 100 : 0;

              return (
                <div
                  key={item.rank}
                  onClick={() => onSelectAcionamento(item)}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-xl border ${badge.border} ${badge.bg} transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg shadow-black/40 group relative`}
                  title="Clique para ver os protocolos e detalhes deste acionamento"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 font-mono-numbers ${badge.text}`}>
                        {item.rank}º
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md group-hover:text-emerald-300 transition-colors">
                        {item.nome}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-white font-mono-numbers">
                        {item.quantidade}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono-numbers">
                        ({item.percentual.toFixed(1)}%)
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Eye className="w-3 h-3" />
                        <span>Ver Protocolos</span>
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar measuring relative weight */}
                  <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${badge.color} transition-all duration-700`}
                      style={{ width: `${Math.max(5, relativePercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Demais casos indicator */}
        {demaisCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Demais casos tiveram apenas 1 registro</span>
            </div>
            <span className="font-mono-numbers text-slate-300 font-medium">
              +{demaisCount} funções ({demaisCasos} registros)
            </span>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/30 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Clique em um acionamento para ver, copiar ou baixar seus protocolos</span>
        </span>

        {topAcionamentos.length > 0 && (
          <button
            type="button"
            onClick={onDownloadAllTopProtocols}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            title="Baixar arquivo TXT com todos os protocolos do Top 3"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Baixar Relatório Geral</span>
          </button>
        )}
      </div>
    </div>
  );
};
