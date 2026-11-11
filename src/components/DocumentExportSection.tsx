import React, { useState } from 'react';
import { FileDown, Copy, Check, Calendar, Clock, Sparkles } from 'lucide-react';
import { ProcessedReport } from '../types';
import { downloadWordDocument, formatReportAsText } from '../utils/wordGenerator';

interface DocumentExportSectionProps {
  report: ProcessedReport;
  onUpdateShiftMeta: (periodo: string, data: string) => void;
  onShowToast: (toast: { type: 'error' | 'warning' | 'info' | 'success'; title: string; message: string }) => void;
}

export const DocumentExportSection: React.FC<DocumentExportSectionProps> = ({
  report,
  onUpdateShiftMeta,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);

  const formattedText = formatReportAsText(report);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      onShowToast({
        type: 'success',
        title: 'Texto Copiado!',
        message: 'O relatório foi copiado no padrão oficial e está pronto para colar no WhatsApp ou chat.',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast({
        type: 'error',
        title: 'Erro ao Copiar',
        message: 'Não foi possível acessar a área de transferência.',
      });
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsGeneratingDocx(true);
      await downloadWordDocument(report);
      onShowToast({
        type: 'success',
        title: 'Download Concluído!',
        message: 'O arquivo Word (.docx) foi gerado e baixado com sucesso no formato oficial.',
      });
    } catch (err: any) {
      onShowToast({
        type: 'error',
        title: 'Erro no Download',
        message: err?.message || 'Falha ao compilar o arquivo Word.',
      });
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden flex flex-col justify-between h-full transition-all">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f1728]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileDown className="w-4 h-4 text-emerald-500" />
            <span>Exportação da Passagem de Turno (Word & WhatsApp)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Documento padronizado oficial com dados atualizados automaticamente da planilha
          </p>
        </div>

        {/* Date & Shift Period Quick Adjusters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <input
              type="text"
              value={report.periodoTurno}
              onChange={(e) => onUpdateShiftMeta(e.target.value, report.dataReferencia)}
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none w-24 text-xs font-mono-numbers font-medium"
              placeholder="08h às 00h"
              title="Período do turno"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <input
              type="text"
              value={report.dataReferencia}
              onChange={(e) => onUpdateShiftMeta(report.periodoTurno, e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none w-24 text-xs font-mono-numbers font-medium"
              placeholder="DD/MM/AAAA"
              title="Data do turno"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="p-5 flex-1">
        <div className="relative group">
          <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-xs font-mono-numbers text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-h-[380px] selection:bg-emerald-500 selection:text-white shadow-inner">
            {formattedText}
          </pre>

          {/* Quick Floating Copy Button in top right of code preview */}
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copiar texto para área de transferência"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Ata oficial com os 5 canais e os Top 3 motivos padronizados.</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-98 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
            <span>{copied ? 'Copiado para WhatsApp' : 'Copiar Texto WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isGeneratingDocx}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGeneratingDocx ? 'Gerando Documento...' : 'Baixar Arquivo Word (.docx)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
