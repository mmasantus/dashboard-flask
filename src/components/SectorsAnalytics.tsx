import React from 'react';
import { MessageSquare, PhoneCall, AlertTriangle, CheckCircle2, PieChart, ExternalLink, Layers, ArrowUpRight } from 'lucide-react';
import { ProcessedReport, SectorMetric } from '../types';

interface SectorsAnalyticsProps {
  report: ProcessedReport;
  onUpdatePendencias: (sectorId: string, value: number) => void;
  onViewSectorFinalizados: (sector: SectorMetric) => void;
  onViewSectorChamados?: (sector: SectorMetric) => void;
  onViewAllDistribution: () => void;
}

export const SectorsAnalytics: React.FC<SectorsAnalyticsProps> = ({
  report,
  onUpdatePendencias,
  onViewSectorFinalizados,
  onViewSectorChamados,
  onViewAllDistribution,
}) => {
  const sectorsList: SectorMetric[] = [
    report.setores.gn,
    report.setores.gv,
    report.setores.gv_antecipada,
    report.setores.franquia,
    report.setores.cb_commerce,
  ].filter(Boolean);

  const totalFinalizados = report.totalFinalizados || 1; // avoid divide by zero

  // SVG Donut calculation
  let cumulativeAngle = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const donutSlices = sectorsList.map((sector) => {
    const fraction = totalFinalizados > 0 ? sector.finalizados / totalFinalizados : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      sector,
      fraction,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden transition-all">
      {/* Header bar */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0f1728]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Consolidação por Canal de Atendimento</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clique na quantidade de finalizados para abrir o box com analistas e assuntos (GN, GV, GV Antecipada, Franquia e CB Commerce)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>5 canais monitorados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800/80">
        {/* Left Side: Modern Interactive Matrix / Table (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Canal / Fila</th>
                  <th className="pb-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                    Finalizados (Clique)
                  </th>
                  <th className="pb-3 text-right font-semibold text-slate-700 dark:text-slate-300">Chamados</th>
                  <th className="pb-3 text-right font-semibold text-slate-700 dark:text-slate-300">Taxa</th>
                  <th className="pb-3 text-center font-semibold text-slate-700 dark:text-slate-300">Pendências</th>
                  <th className="pb-3 text-right font-semibold text-slate-700 dark:text-slate-300">Carga %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sectorsList.map((sector) => {
                  const percentOfTotal = totalFinalizados > 0 ? (sector.finalizados / totalFinalizados) * 100 : 0;

                  return (
                    <tr
                      key={sector.id}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Badge */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sector.accentColor }}
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors text-xs truncate block">
                              {sector.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {sector.shortName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Finalizados (Clickable - Exibe atendimentos com analista e tema) */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers">
                        <button
                          type="button"
                          onClick={() => onViewSectorFinalizados(sector)}
                          disabled={sector.finalizados === 0}
                          className="inline-flex flex-col items-end group/btn cursor-pointer disabled:cursor-default disabled:opacity-50 text-right p-1 -mr-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all"
                          title={`Clique para ver os ${sector.finalizados} atendimentos de ${sector.name} com analista e tema`}
                        >
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover/btn:text-emerald-600 dark:group-hover/btn:text-emerald-400 flex items-center gap-1">
                            {sector.finalizados}
                            {sector.finalizados > 0 && (
                              <ArrowUpRight className="w-3 h-3 text-emerald-500 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                            )}
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, percentOfTotal)}%`,
                                backgroundColor: sector.accentColor,
                              }}
                            />
                          </div>
                        </button>
                      </td>

                      {/* Chamados (Clickable to view chamados) */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers">
                        {onViewSectorChamados && sector.chamados > 0 ? (
                          <button
                            type="button"
                            onClick={() => onViewSectorChamados(sector)}
                            className="text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
                            title={`Ver ${sector.chamados} chamados de ${sector.name}`}
                          >
                            {sector.chamados}
                          </button>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-200 font-medium">{sector.chamados}</span>
                        )}
                      </td>

                      {/* Taxa */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers text-slate-500 dark:text-slate-400">
                        {sector.taxaChamados.toFixed(1)}%
                      </td>

                      {/* Pendencias (Editable input) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2 py-1 focus-within:border-emerald-500 transition-colors">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={sector.pendencias}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              onUpdatePendencias(sector.id, isNaN(val) ? 0 : Math.max(0, val));
                            }}
                            className="w-10 bg-transparent text-center text-xs font-mono-numbers text-slate-900 dark:text-white outline-none font-semibold"
                            title="Valor de pendências deste canal"
                          />
                        </div>
                      </td>

                      {/* Carga % */}
                      <td className="py-3.5 pl-3 text-right font-mono-numbers font-bold text-slate-700 dark:text-slate-300">
                        {percentOfTotal.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Clique em qualquer número de finalizados para ver os protocolos
            </span>
            <span className="font-mono-numbers text-slate-700 dark:text-slate-300 font-medium">
              Total Finalizados: {report.totalFinalizados} | Total Chamados: {report.totalChamados}
            </span>
          </div>
        </div>

        {/* Right Side: Proportional Chart & Breakdown (4 cols) - Clickable to view all channels */}
        <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={onViewAllDistribution}
                className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer group/title transition-colors"
                title="Clique para ver todos os protocolos separados por canais"
              >
                <PieChart className="w-3.5 h-3.5 text-blue-500" />
                <span>Distribuição do Volume</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-500 opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </button>
              <button
                type="button"
                onClick={onViewAllDistribution}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Ver Canais
              </button>
            </div>

            {/* Circular Donut Diagram (Clickable) */}
            <div
              onClick={onViewAllDistribution}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onViewAllDistribution();
                }
              }}
              className="relative flex items-center justify-center my-4 cursor-pointer group/donut"
              title="Clique para abrir todos os protocolos separados por canais"
            >
              <svg className="w-36 h-36 transform -rotate-90 group-hover/donut:scale-105 transition-transform duration-300" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="16"
                  fill="transparent"
                />

                {/* Slices */}
                {donutSlices.map((slice, index) => {
                  if (slice.fraction <= 0) return null;
                  return (
                    <circle
                      key={index}
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={slice.sector.accentColor}
                      strokeWidth="16"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 hover:opacity-90"
                    />
                  );
                })}
              </svg>

              {/* Center text in donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono-numbers text-slate-900 dark:text-white leading-none group-hover/donut:text-emerald-600 dark:group-hover/donut:text-emerald-400 transition-colors">
                  {report.totalFinalizados}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Finalizados</span>
                <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover/donut:opacity-100 transition-opacity">
                  Abrir box
                </span>
              </div>
            </div>
          </div>

          {/* Sector Legend */}
          <div className="space-y-1.5 pt-2">
            {sectorsList.map((sector) => {
              const pct = totalFinalizados > 0 ? (sector.finalizados / totalFinalizados) * 100 : 0;
              return (
                <div
                  key={sector.id}
                  onClick={() => onViewSectorFinalizados(sector)}
                  role="button"
                  tabIndex={0}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  title={`Clique para ver os atendimentos de ${sector.name}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sector.accentColor }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 font-medium truncate">
                      {sector.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-numbers text-slate-500 dark:text-slate-400 text-[11px]">
                    <span className="text-slate-900 dark:text-white font-semibold">{sector.finalizados}</span>
                    <span>({pct.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
