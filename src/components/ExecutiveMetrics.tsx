import React from 'react';
import { CheckCircle2, PhoneCall, Percent, TrendingUp, Layers } from 'lucide-react';
import { ProcessedReport } from '../types';

interface ExecutiveMetricsProps {
  report: ProcessedReport;
}

export const ExecutiveMetrics: React.FC<ExecutiveMetricsProps> = ({ report }) => {
  // Find top channel by finalized volume
  const sectorList = Object.values(report.setores);
  const topSector = sectorList.reduce((max, s) => (s.finalizados > max.finalizados ? s : max), sectorList[0]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Finalizados */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Finalizados</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white font-mono-numbers">
            {report.totalFinalizados}
          </span>
          <span className="text-xs text-emerald-400 font-medium">atendimentos</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
          <span>{report.totalLinhasBrutas} registros no relatório</span>
        </div>
      </div>

      {/* Metric 2: Total Chamados */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Chamados</span>
          <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400 flex items-center justify-center">
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white font-mono-numbers">
            {report.totalChamados}
          </span>
          <span className="text-xs text-blue-400 font-medium">tickets gerados</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
          <span>Necessitaram de abertura de chamado</span>
        </div>
      </div>

      {/* Metric 3: Taxa de Chamados */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Taxa Geral de Chamados</span>
          <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white font-mono-numbers">
            {report.taxaGeralChamados.toFixed(1)}%
          </span>
          <span className="text-xs text-amber-400 font-medium">dos atendimentos</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
          <span>Proporção de chamados / finalizados</span>
        </div>
      </div>

      {/* Metric 4: Canal Líder */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Canal de Maior Volume</span>
          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white truncate">
            {topSector ? topSector.name : '-'}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-mono-numbers font-medium text-purple-400">
            {topSector ? topSector.finalizados : 0}
          </span>
          <span>finalizados ({topSector ? topSector.percentOfTotal.toFixed(0) : 0}% da carga)</span>
        </div>
      </div>
    </div>
  );
};
