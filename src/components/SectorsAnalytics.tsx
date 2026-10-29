import React from 'react';
import { MessageSquare, PhoneCall, AlertTriangle, CheckCircle2, PieChart } from 'lucide-react';
import { ProcessedReport, SectorMetric } from '../types';

interface SectorsAnalyticsProps {
  report: ProcessedReport;
  onUpdatePendencias: (sectorId: string, value: number) => void;
}

export const SectorsAnalytics: React.FC<SectorsAnalyticsProps> = ({
  report,
  onUpdatePendencias,
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      {/* Header bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Consolidação por Canal de Atendimento</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribuição de chamados, finalizações e pendências manuais por fila
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>5 canais monitorados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Side: Modern Interactive Matrix / Table (8 cols) */}
        <div className="lg:col-span-8 p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 font-semibold text-slate-300">Canal / Fila</th>
                  <th className="pb-3 text-right font-semibold text-slate-300">Finalizados</th>
                  <th className="pb-3 text-right font-semibold text-slate-300">Chamados</th>
                  <th className="pb-3 text-right font-semibold text-slate-300">Taxa</th>
                  <th className="pb-3 text-center font-semibold text-slate-300">Pendências</th>
                  <th className="pb-3 text-right font-semibold text-slate-300">Carga %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sectorsList.map((sector) => {
                  const percentOfTotal = totalFinalizados > 0 ? (sector.finalizados / totalFinalizados) * 100 : 0;

                  return (
                    <tr
                      key={sector.id}
                      className="group hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Badge */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sector.accentColor }}
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-white group-hover:text-emerald-300 transition-colors text-xs truncate block">
                              {sector.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {sector.shortName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Finalizados */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers font-semibold text-white">
                        <div className="flex flex-col items-end">
                          <span className="text-sm">{sector.finalizados}</span>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, percentOfTotal)}%`,
                                backgroundColor: sector.accentColor,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Chamados */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers">
                        <span className="text-slate-200 font-medium">{sector.chamados}</span>
                      </td>

                      {/* Taxa */}
                      <td className="py-3.5 px-3 text-right font-mono-numbers text-slate-400">
                        {sector.taxaChamados.toFixed(1)}%
                      </td>

                      {/* Pendencias (Editable input) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2 py-1 focus-within:border-emerald-500 transition-colors">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={sector.pendencias}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              onUpdatePendencias(sector.id, isNaN(val) ? 0 : Math.max(0, val));
                            }}
                            className="w-8 text-center text-xs font-mono-numbers bg-transparent text-amber-200 outline-none"
                            title="Ajustar pendências manuais deste setor"
                          />
                        </div>
                      </td>

                      {/* Carga % */}
                      <td className="py-3.5 pl-3 text-right font-mono-numbers font-bold text-slate-300">
                        {percentOfTotal.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Valores de pendências podem ser editados manualmente acima.</span>
            <span className="font-mono-numbers text-slate-300 font-medium">
              Total Finalizados: {report.totalFinalizados} | Total Chamados: {report.totalChamados}
            </span>
          </div>
        </div>

        {/* Right Side: Proportional Chart & Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-slate-900/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-blue-400" />
                <span>Distribuição do Volume</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono-numbers">100% dos canais</span>
            </div>

            {/* Circular Donut Diagram */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-800"
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
                      className="transition-all duration-700 hover:opacity-90 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Center text in donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono-numbers text-white leading-none">
                  {report.totalFinalizados}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Finalizados</span>
              </div>
            </div>
          </div>

          {/* Sector Legend */}
          <div className="space-y-1.5 pt-2">
            {sectorsList.map((sector) => {
              const pct = totalFinalizados > 0 ? (sector.finalizados / totalFinalizados) * 100 : 0;
              return (
                <div key={sector.id} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: sector.accentColor }}
                    />
                    <span className="text-slate-300 truncate">{sector.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-numbers text-slate-400 text-[11px]">
                    <span className="text-white font-medium">{sector.finalizados}</span>
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
