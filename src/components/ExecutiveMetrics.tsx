import React from 'react';
import { CheckCircle2, PhoneCall, Percent, TrendingUp, ArrowUpRight, ExternalLink } from 'lucide-react';
import { ProcessedReport } from '../types';

interface ExecutiveMetricsProps {
  report: ProcessedReport;
  onViewTotalFinalizados: () => void;
  onViewTotalChamados: () => void;
  onViewTopSector?: () => void;
}

export const ExecutiveMetrics: React.FC<ExecutiveMetricsProps> = ({
  report,
  onViewTotalFinalizados,
  onViewTotalChamados,
  onViewTopSector,
}) => {
  const sectorList = Object.values(report.setores);
  const topSector = sectorList.reduce((max, s) => (s.finalizados > max.finalizados ? s : max), sectorList[0]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Finalizados (Clickable to inspect all finalized protocols) */}
      <div
        onClick={onViewTotalFinalizados}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewTotalFinalizados();
          }
        }}
        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-500/80 transition-all cursor-pointer active:scale-98"
        title="Clique para ver todos os atendimentos finalizados com protocolo, analista e tema"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Total Finalizados
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono-numbers">
            {report.totalFinalizados}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">atendimentos</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{report.totalLinhasBrutas} registros no relatório</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-transform">
            Ver detalhes <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Metric 2: Total Chamados (Clickable to inspect all tickets/chamados abertos) */}
      <div
        onClick={onViewTotalChamados}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewTotalChamados();
          }
        }}
        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500/80 transition-all cursor-pointer active:scale-98"
        title="Clique para ver os chamados abertos com protocolo, chamado, tema e analista"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Total Chamados
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono-numbers">
            {report.totalChamados}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">tickets abertos</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Demandaram abertura de chamado</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-transform">
            Ver chamados <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Metric 3: Taxa de Chamados */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Taxa Geral de Chamados</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono-numbers">
            {report.taxaGeralChamados.toFixed(1)}%
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">dos atendimentos</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Proporção de chamados / finalizados</span>
        </div>
      </div>

      {/* Metric 4: Canal Líder (Clickable to inspect top sector) */}
      <div
        onClick={onViewTopSector}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onViewTopSector) onViewTopSector();
          }
        }}
        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden group hover:border-purple-400 dark:hover:border-purple-500/80 transition-all cursor-pointer active:scale-98"
        title="Clique para ver os atendimentos do canal líder"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            Canal de Maior Volume
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {topSector ? topSector.name : '-'}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-mono-numbers font-medium text-purple-600 dark:text-purple-400">
              {topSector ? topSector.finalizados : 0}
            </span>{' '}
            <span>({topSector ? topSector.percentOfTotal.toFixed(0) : 0}% da carga)</span>
          </div>
          <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-transform">
            Ver fila <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
