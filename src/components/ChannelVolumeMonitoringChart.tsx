import React, { useState } from 'react';
import { Activity, Zap, Clock, ExternalLink } from 'lucide-react';
import { ProcessedReport, HourlyVolumePoint, ProtocoloItem } from '../types';

interface ChannelVolumeMonitoringChartProps {
  report: ProcessedReport;
  onViewPeakProtocols?: (peak: {
    canal: string;
    hora: string;
    volume: number;
    protocolos?: ProtocoloItem[];
  }) => void;
  onViewHourProtocols?: (point: HourlyVolumePoint, channelFilter?: string) => void;
}

type ViewType = 'all' | 'total' | 'gn' | 'gv' | 'gv_antecipada' | 'franquia' | 'cb_commerce';

export const ChannelVolumeMonitoringChart: React.FC<ChannelVolumeMonitoringChartProps> = ({
  report,
  onViewPeakProtocols,
  onViewHourProtocols,
}) => {
  const [selectedView, setSelectedView] = useState<ViewType>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const dataPoints = report.hourlyDistribution || [];
  if (dataPoints.length === 0) return null;

  // Helper to get value of selected view for a point
  const getChannelValue = (d: HourlyVolumePoint, view: ViewType): number => {
    switch (view) {
      case 'gn': return d.gn;
      case 'gv': return d.gv;
      case 'gv_antecipada': return d.gv_antecipada;
      case 'franquia': return d.franquia;
      case 'cb_commerce': return d.cb_commerce;
      case 'total': return d.total;
      default: return d.total;
    }
  };

  // Dynamic maximum for SVG scaling:
  // If viewing a single channel with 1 case (e.g. Whats GV = 1), scale to 2 so it is clearly visible in the center!
  const maxVal = (() => {
    if (selectedView === 'all' || selectedView === 'total') {
      const maxTotal = Math.max(...dataPoints.map((d) => d.total), 1);
      return Math.max(maxTotal, 4);
    }
    const channelMax = Math.max(...dataPoints.map((d) => getChannelValue(d, selectedView)), 1);
    return Math.max(channelMax, 2);
  })();

  // Chart dimensions
  const svgWidth = 840;
  const svgHeight = 260;
  const paddingX = 55;
  const paddingTop = 32;
  const paddingBottom = 42;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getCoordinates = (values: number[]) => {
    return values.map((val, idx) => {
      const x = paddingX + (idx / Math.max(values.length - 1, 1)) * chartWidth;
      const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
      return { x, y, val };
    });
  };

  // Helper to generate smooth cubic bezier SVG path
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX1 = current.x + (next.x - current.x) / 2;
      const controlY1 = current.y;
      const controlX2 = current.x + (next.x - current.x) / 2;
      const controlY2 = next.y;
      d += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const createAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const smoothLine = createSmoothPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const bottomY = paddingTop + chartHeight;
    return `${smoothLine} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  };

  const totalPoints = getCoordinates(dataPoints.map((d) => d.total));
  const gnPoints = getCoordinates(dataPoints.map((d) => d.gn));
  const gvPoints = getCoordinates(dataPoints.map((d) => d.gv));
  const gvAntecipadaPoints = getCoordinates(dataPoints.map((d) => d.gv_antecipada));
  const franquiaPoints = getCoordinates(dataPoints.map((d) => d.franquia));
  const cbCommercePoints = getCoordinates(dataPoints.map((d) => d.cb_commerce));

  // Determine peak coordinates
  const peakData = report.picoVolumetria || {
    canal: 'Whats GN',
    hora: '14h-16h',
    volume: Math.max(...dataPoints.map((d) => d.gn)),
    cor: '#10b981',
  };

  const peakIdx = dataPoints.findIndex((d) => d.hora === peakData.hora);
  const targetChannelPoints =
    peakData.canal.includes('GV') && !peakData.canal.includes('Antecipada')
      ? gvPoints
      : gnPoints;
  const peakCoord = peakIdx >= 0 ? targetChannelPoints[peakIdx] : targetChannelPoints[3] || targetChannelPoints[0];

  // Active view points for single channel views
  const getActiveViewPoints = () => {
    switch (selectedView) {
      case 'gn': return gnPoints;
      case 'gv': return gvPoints;
      case 'gv_antecipada': return gvAntecipadaPoints;
      case 'franquia': return franquiaPoints;
      case 'cb_commerce': return cbCommercePoints;
      default: return totalPoints;
    }
  };

  const activePoints = getActiveViewPoints();

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0f1728]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Painel de Monitorização • Curva de Volumetria dos Canais
          </h3>
        </div>

        {/* View Switcher Tabs (All 5 channels + Total + All) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSelectedView('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedView === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos os Canais
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('total')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedView === 'total'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Total Consolidado
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('gn')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedView === 'gn'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Whats GN
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('gv')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedView === 'gv'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Whats GV
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('gv_antecipada')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedView === 'gv_antecipada'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            GV Antecipada
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('franquia')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedView === 'franquia'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Franquia
          </button>
        </div>
      </div>

      {/* Destaque Exclusivo: Maior Pico de Contatos (Clicável para abrir os protocolos do pico) */}
      <div className="p-5 sm:p-6 bg-slate-50/40 dark:bg-[#0c121e]/80 border-b border-slate-200 dark:border-slate-800/80">
        <div
          onClick={() => onViewPeakProtocols?.(peakData)}
          role="button"
          tabIndex={0}
          title="Clique para ver os protocolos registrados no pico de volumetria"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onViewPeakProtocols?.(peakData);
            }
          }}
          className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent hover:from-emerald-500/20 hover:via-emerald-500/10 border border-emerald-300/80 hover:border-emerald-500 dark:border-emerald-500/30 dark:hover:border-emerald-500/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-mono">
                  Maior Pico de Contatos
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md font-bold font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 whitespace-nowrap">
                  Canal: {peakData.canal}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium mt-1">
                Pico registrado na faixa das <strong className="font-bold text-slate-900 dark:text-white">{peakData.hora}</strong> com <strong className="text-emerald-700 dark:text-emerald-400 font-mono-numbers font-bold">{peakData.volume} atendimentos</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all">
              <span>Ver {peakData.volume} Protocolos do Pico</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>{report.periodoTurno}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG High-Contrast Trend Curve Graphic */}
      <div className="p-5 sm:p-6">
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[650px] select-none"
          >
            <defs>
              {/* Gradients for high contrast in light & dark */}
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradGN" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradGV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradGVAnt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="gradFran" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>

              {/* Static subtle glow filter for peak halo */}
              <filter id="peakGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = paddingTop + chartHeight * (1 - pct);
              const labelVal = Math.round(maxVal * pct);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="1"
                    strokeDasharray={pct === 0 ? '0' : '4 4'}
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold"
                  >
                    {labelVal}
                  </text>
                </g>
              );
            })}

            {/* Total Area & Curve */}
            {(selectedView === 'all' || selectedView === 'total') && (
              <>
                <path
                  d={createAreaPath(totalPoints)}
                  fill="url(#gradTotal)"
                />
                <path
                  d={createSmoothPath(totalPoints)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={selectedView === 'total' ? '3.5' : '2.5'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </>
            )}

            {/* Whats GN Curve & Area */}
            {(selectedView === 'all' || selectedView === 'gn') && (
              <>
                <path
                  d={createAreaPath(gnPoints)}
                  fill="url(#gradGN)"
                />
                <path
                  d={createSmoothPath(gnPoints)}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={selectedView === 'gn' ? '3.5' : '3'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </>
            )}

            {/* Whats GV Curve & Area (Dynamically scaled & clearly visible) */}
            {(selectedView === 'all' || selectedView === 'gv') && (
              <>
                {selectedView === 'gv' && (
                  <path
                    d={createAreaPath(gvPoints)}
                    fill="url(#gradGV)"
                  />
                )}
                <path
                  d={createSmoothPath(gvPoints)}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth={selectedView === 'gv' ? '3.5' : '2.5'}
                  strokeLinecap="round"
                  strokeDasharray={selectedView === 'all' ? '4 2' : '0'}
                  className="transition-all duration-300"
                />
              </>
            )}

            {/* GV Antecipada Curve */}
            {(selectedView === 'all' || selectedView === 'gv_antecipada') && (
              <>
                {selectedView === 'gv_antecipada' && (
                  <path
                    d={createAreaPath(gvAntecipadaPoints)}
                    fill="url(#gradGVAnt)"
                  />
                )}
                <path
                  d={createSmoothPath(gvAntecipadaPoints)}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth={selectedView === 'gv_antecipada' ? '3.5' : '2'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </>
            )}

            {/* Franquia Curve */}
            {(selectedView === 'all' || selectedView === 'franquia') && (
              <>
                {selectedView === 'franquia' && (
                  <path
                    d={createAreaPath(franquiaPoints)}
                    fill="url(#gradFran)"
                  />
                )}
                <path
                  d={createSmoothPath(franquiaPoints)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={selectedView === 'franquia' ? '3.5' : '2'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </>
            )}

            {/* CB Commerce Curve */}
            {(selectedView === 'all' || selectedView === 'cb_commerce') && (
              <path
                d={createSmoothPath(cbCommercePoints)}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={selectedView === 'cb_commerce' ? '3.5' : '2'}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Vertical Marker on Peak Point (Static & Clickable) */}
            <g
              onClick={() => onViewPeakProtocols?.(peakData)}
              className="cursor-pointer group"
              role="button"
              tabIndex={0}
            >
              <line
                x1={peakCoord.x}
                y1={paddingTop}
                x2={peakCoord.x}
                y2={paddingTop + chartHeight}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-75"
              />
              <circle
                cx={peakCoord.x}
                cy={peakCoord.y}
                r="10"
                fill="#10b981"
                fillOpacity="0.25"
                className="group-hover:opacity-90 transition-opacity"
              />
              <circle
                cx={peakCoord.x}
                cy={peakCoord.y}
                r="5.5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#peakGlow)"
              />
              {/* Spacious Peak Callout Box (width 200, never cut off text or 'N') */}
              <g transform={`translate(${peakCoord.x}, ${Math.max(24, peakCoord.y - 25)})`}>
                <rect
                  x="-100"
                  y="-18"
                  width="200"
                  height="26"
                  rx="7"
                  className="fill-slate-900 dark:fill-white shadow-lg transition-transform group-hover:scale-105"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  className="fill-white dark:fill-slate-900 font-bold text-[11px] font-mono select-none"
                >
                  ⚡ PICO: {peakData.volume} casos ({peakData.canal})
                </text>
              </g>
            </g>

            {/* Data Point Dots & Clickable Hitboxes */}
            {dataPoints.map((pt, idx) => {
              const coord = activePoints[idx] || totalPoints[idx];
              const isHovered = hoveredPointIndex === idx;
              const val = getChannelValue(pt, selectedView);

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  onClick={() => onViewHourProtocols?.(pt, selectedView)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  {/* Invisible hitbox for easy mouse targeting */}
                  <rect
                    x={coord.x - 25}
                    y={paddingTop}
                    width={50}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {/* Highlight vertical stripe on hover */}
                  {isHovered && (
                    <line
                      x1={coord.x}
                      y1={paddingTop}
                      x2={coord.x}
                      y2={paddingTop + chartHeight}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      className="opacity-40"
                    />
                  )}

                  {/* GN dot */}
                  {(selectedView === 'all' || selectedView === 'gn') && (
                    <circle
                      cx={gnPoints[idx].x}
                      cy={gnPoints[idx].y}
                      r={isHovered ? '6' : '3.5'}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                    />
                  )}

                  {/* GV dot */}
                  {(selectedView === 'all' || selectedView === 'gv') && (
                    <circle
                      cx={gvPoints[idx].x}
                      cy={gvPoints[idx].y}
                      r={isHovered ? '6' : selectedView === 'gv' ? '4.5' : '3'}
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                    />
                  )}

                  {/* Total dot */}
                  {selectedView === 'total' && (
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? '6' : '3.5'}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                    />
                  )}

                  {/* Interactive Tooltip on Hover */}
                  {isHovered && (
                    <g transform={`translate(${coord.x}, ${Math.max(30, coord.y - 28)})`}>
                      <rect
                        x="-70"
                        y="-16"
                        width="140"
                        height="22"
                        rx="5"
                        className="fill-slate-900/90 dark:fill-slate-100/90 shadow-md"
                      />
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        className="fill-white dark:fill-slate-900 text-[10px] font-bold font-mono"
                      >
                        {pt.hora}: {val} {val === 1 ? 'caso' : 'casos'} ↗
                      </text>
                    </g>
                  )}

                  {/* X Axis Time Labels */}
                  <text
                    x={coord.x}
                    y={paddingTop + chartHeight + 22}
                    textAnchor="middle"
                    className={`text-[10px] font-mono transition-colors ${
                      isHovered
                        ? 'fill-slate-900 dark:fill-white font-bold'
                        : 'fill-slate-400 dark:fill-slate-500 font-medium'
                    }`}
                  >
                    {pt.hora}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend Bar with high-contrast channel colors */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Whats GN (Canal Líder)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-[#0284c7]" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Whats GV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-purple-500" />
              <span className="text-slate-600 dark:text-slate-300">Whats GV Antecipada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-300">Whats Franquia</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-slate-600 dark:text-slate-300">Whats CB Commerce</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Turno: {report.periodoTurno} • Data: {report.dataReferencia}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
