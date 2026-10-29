import React from 'react';
import { Trophy, Award, BarChart3, Info } from 'lucide-react';
import { TopAcionamento } from '../types';

interface TopAcionamentosSectionProps {
  topAcionamentos: TopAcionamento[];
  demaisCount: number;
  demaisCasos: number;
}

export const TopAcionamentosSection: React.FC<TopAcionamentosSectionProps> = ({
  topAcionamentos,
  demaisCount,
  demaisCasos,
}) => {
  const maxQuantidade = topAcionamentos.length > 0 ? topAcionamentos[0].quantidade : 1;

  const medalBadges = [
    { rank: 1, label: '1º Lugar', color: 'from-amber-400 to-yellow-500', text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/40' },
    { rank: 2, label: '2º Lugar', color: 'from-slate-300 to-slate-400', text: 'text-slate-300', border: 'border-slate-500/40', bg: 'bg-slate-900/60' },
    { rank: 3, label: '3º Lugar', color: 'from-amber-600 to-amber-700', text: 'text-amber-600', border: 'border-amber-700/40', bg: 'bg-amber-950/30' },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top Acionamentos (Função do Sistema)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Principais motivos que demandaram atendimento na operação
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-lg">
          <Award className="w-3.5 h-3.5" />
          <span className="font-semibold">Top 3 Oficiais</span>
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
                  className={`p-3.5 rounded-xl border ${badge.border} ${badge.bg} transition-all hover:border-slate-600`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 font-mono-numbers ${badge.text}`}>
                        {item.rank}º
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
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

      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/30 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Base calculada sobre todos os canais filtrados</span>
        <span className="flex items-center gap-1 text-slate-300">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Frequência absoluta e percentual</span>
        </span>
      </div>
    </div>
  );
};
