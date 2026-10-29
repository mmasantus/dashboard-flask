import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, RefreshCw, X, FileText } from 'lucide-react';
import { isValidFileFormat, SUPPORTED_EXTENSIONS } from '../utils/fileParser';
import { ProcessedReport } from '../types';

interface UploadZoneProps {
  currentReport: ProcessedReport | null;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onShowToast: (toast: { type: 'error' | 'warning' | 'info' | 'success'; title: string; message: string }) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  currentReport,
  isLoading,
  onFileSelect,
  onClear,
  onShowToast,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidateAndSelect = (file: File) => {
    setFormatError(null);

    if (!isValidFileFormat(file.name)) {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'sem extensão';
      const errorMsg = `O arquivo selecionado (${file.name}) possui formato .${ext}, que não é suportado.`;
      setFormatError(errorMsg);
      onShowToast({
        type: 'error',
        title: 'Formato de Arquivo Não Suportado',
        message: `Utilize apenas relatórios extraídos do MKTZAP com extensão: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      });
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndSelect(e.target.files[0]);
    }
    // Reset value so the user can re-upload the same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Unsupported Format Alert */}
      {formatError && (
        <div className="mb-4 p-4 rounded-xl border border-rose-600/40 bg-rose-950/40 text-rose-200 flex items-start gap-3 transition-all animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs leading-relaxed">
            <p className="font-semibold text-sm text-rose-300">{formatError}</p>
            <p className="mt-1 text-slate-300">
              Formato correto esperado: relatórios de atendimento do sistema em{' '}
              <span className="font-mono text-emerald-300 font-semibold">.html</span>,{' '}
              <span className="font-mono text-emerald-300 font-semibold">.xls</span>,{' '}
              <span className="font-mono text-emerald-300 font-semibold">.xlsx</span> ou{' '}
              <span className="font-mono text-emerald-300 font-semibold">.csv</span>.
            </p>
          </div>
          <button
            onClick={() => setFormatError(null)}
            className="text-slate-400 hover:text-white p-1 rounded"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* When data is already loaded, show a compact status toolbar */}
      {currentReport ? (
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                  Planilha Ativa
                </span>
                <span className="text-xs text-slate-400">
                  {currentReport.totalLinhasBrutas} registros processados
                </span>
              </div>
              <p className="text-sm font-medium text-white truncate max-w-md mt-0.5">
                {currentReport.filename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              accept=".xls,.xlsx,.html,.htm,.csv,.tsv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shadow-sm hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Substituir Planilha</span>
            </button>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 rounded-xl transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Large interactive dropzone for initial state */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer group rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-950/20 shadow-2xl shadow-emerald-950/40 scale-[1.005]'
              : 'border-slate-700/80 hover:border-emerald-500/60 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept=".xls,.xlsx,.html,.htm,.csv,.tsv"
            className="hidden"
          />

          <div className="max-w-md mx-auto flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-xl ${
                isDragOver
                  ? 'bg-emerald-600 text-white scale-110 shadow-emerald-600/40'
                  : 'bg-slate-800 text-emerald-400 group-hover:bg-emerald-950/80 group-hover:text-emerald-300 group-hover:scale-105'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 transition-transform group-hover:-translate-y-0.5" />
              )}
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              {isLoading
                ? 'Lendo e consolidando dados da planilha...'
                : 'Arraste o relatório do MKTZAP aqui'}
            </h3>

            <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
              Ou clique em qualquer lugar desta área para selecionar o arquivo exportado do seu computador.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                .html / .htm
              </span>
              <span className="text-[11px] font-mono font-medium text-blue-400 bg-blue-950/70 border border-blue-800/60 px-2.5 py-1 rounded-md">
                .xlsx / .xls
              </span>
              <span className="text-[11px] font-mono font-medium text-purple-400 bg-purple-950/70 border border-purple-800/60 px-2.5 py-1 rounded-md">
                .csv
              </span>
            </div>

            <button
              type="button"
              className="mt-6 px-6 py-2.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:scale-98 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 pointer-events-none"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Selecionar Arquivo no Computador</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
