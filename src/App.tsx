import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ExecutiveMetrics } from './components/ExecutiveMetrics';
import { SectorsAnalytics } from './components/SectorsAnalytics';
import { TopAcionamentosSection } from './components/TopAcionamentosSection';
import { DocumentExportSection } from './components/DocumentExportSection';
import { AtendentesModal } from './components/AtendentesModal';
import { ToastContainer } from './components/Toast';
import { ProcessedReport, ToastMessage } from './types';
import { parseMktzapFile, getDemoReport, processExtractedRows, DEFAULT_GV_PESSOAS } from './utils/fileParser';
import { ShieldCheck, FileSpreadsheet, Sparkles, BarChart2, Layers } from 'lucide-react';

export default function App() {
  const [report, setReport] = useState<ProcessedReport | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, any>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gvPessoas, setGvPessoas] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mktzap_equipe_experiencia_brasil');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_GV_PESSOAS;
  });
  const [isAtendentesModalOpen, setIsAtendentesModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const { report: processed, rows } = await parseMktzapFile(file, gvPessoas);
      setRawRows(rows);
      setReport(processed);
      addToast({
        type: 'success',
        title: 'Planilha Processada com Sucesso!',
        message: `${processed.totalFinalizados} atendimentos finalizados e ${processed.totalChamados} chamados contabilizados.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao Processar Arquivo',
        message: err?.message || 'Verifique se o arquivo possui as colunas esperadas do relatório MKTZAP.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    const demo = getDemoReport();
    setRawRows(null);
    setReport(demo);
    addToast({
      type: 'info',
      title: 'Exemplo Demonstrativo Carregado',
      message: 'Métricas e modelo de relatório preenchidos com os dados de referência.',
    });
  };

  const handleClearData = () => {
    setReport(null);
    setRawRows(null);
    addToast({
      type: 'warning',
      title: 'Dados Limpos',
      message: 'O relatório foi removido da tela. Você pode carregar um novo arquivo a qualquer momento.',
    });
  };

  const handleUpdatePendencias = (sectorId: string, value: number) => {
    if (!report) return;
    const currentSector = report.setores[sectorId];
    if (!currentSector) return;

    const updatedSetores = {
      ...report.setores,
      [sectorId]: {
        ...currentSector,
        pendencias: value,
      },
    };

    const totalPendencias = Object.values(updatedSetores).reduce((acc, curr) => acc + curr.pendencias, 0);

    setReport({
      ...report,
      setores: updatedSetores,
      totalPendencias,
    });
  };

  const handleUpdateShiftMeta = (periodo: string, data: string) => {
    if (!report) return;
    setReport({
      ...report,
      periodoTurno: periodo,
      dataReferencia: data,
    });
  };

  const handleSaveAtendentes = (newList: string[]) => {
    setGvPessoas(newList);
    try {
      localStorage.setItem('mktzap_equipe_experiencia_brasil', JSON.stringify(newList));
    } catch {}

    // Recalcula a planilha ativa na hora para refletir o novo integrante!
    if (rawRows && report) {
      const recalculated = processExtractedRows(rawRows, report.filename, newList, report.periodoTurno);
      // Mantém pendências manuais já preenchidas
      Object.keys(report.setores).forEach((sId) => {
        if (recalculated.setores[sId]) {
          recalculated.setores[sId].pendencias = report.setores[sId].pendencias;
        }
      });
      recalculated.totalPendencias = report.totalPendencias;
      setReport(recalculated);

      addToast({
        type: 'success',
        title: 'Equipe Experiência Brasil Atualizada!',
        message: `Planilha recalculada imediatamente com os ${newList.length} integrantes. Os números na tela e a ata Word foram atualizados.`,
      });
    } else {
      addToast({
        type: 'success',
        title: 'Equipe Experiência Brasil Salva!',
        message: `Lista salva com ${newList.length} integrantes. Terá impacto direto em qualquer planilha processada.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        hasData={!!report}
        onLoadDemo={handleLoadDemo}
        onClearData={handleClearData}
        onOpenAtendentes={() => setIsAtendentesModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload & Dropzone Section */}
        <section aria-label="Upload de Relatório">
          <UploadZone
            currentReport={report}
            isLoading={isLoading}
            onFileSelect={handleFileSelect}
            onClear={handleClearData}
            onShowToast={addToast}
          />
        </section>

        {/* Dashboard Analytics (Rendered when report is loaded) */}
        {report ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Strip */}
            <section aria-label="Indicadores Executivos">
              <ExecutiveMetrics report={report} />
            </section>

            {/* Sectors Analytics Board & SVG Chart */}
            <section aria-label="Consolidação por Canais">
              <SectorsAnalytics
                report={report}
                onUpdatePendencias={handleUpdatePendencias}
              />
            </section>

            {/* Split Grid: Top Acionamentos & Word / WhatsApp Document Generator */}
            <section
              aria-label="Análise e Exportação"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Column: Top Acionamentos (5 cols) */}
              <div className="lg:col-span-5 h-full">
                <TopAcionamentosSection
                  topAcionamentos={report.topAcionamentos}
                  demaisCount={report.demaisAcionamentosCount}
                  demaisCasos={report.demaisAcionamentosCasos}
                />
              </div>

              {/* Right Column: Word Document & WhatsApp Generator (7 cols) */}
              <div className="lg:col-span-7 h-full">
                <DocumentExportSection
                  report={report}
                  onUpdateShiftMeta={handleUpdateShiftMeta}
                  onShowToast={addToast}
                />
              </div>
            </section>
          </div>
        ) : (
          /* Empty / Welcome State */
          <div className="py-12 px-6 rounded-3xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm text-center max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-600/30 text-emerald-400 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-emerald-950/40">
              <Sparkles className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Painel de Passagem de Turno MKTZAP
            </h2>

            <p className="text-sm text-slate-400 mt-2.5 max-w-xl mx-auto leading-relaxed">
              Carregue a planilha extraída do sistema para consolidar automaticamente os atendimentos
              finalizados, contagem de chamados, taxa de acionamento por fila e gerar a ata em Word (.docx).
            </p>

            {/* 3 Quick highlights */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span>Consolidação por Aba</span>
                </div>
                <p className="text-xs text-slate-400">
                  Calcula Whats GN, Whats GV, GV Antecipada, Franquia e CB Commerce com precisão.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Top Acionamentos</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ranking visual dos motivos com maior incidência e cálculo de representatividade.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>Exportação Word</span>
                </div>
                <p className="text-xs text-slate-400">
                  Download com 1 clique do documento Word (.docx) padronizado ou cópia para WhatsApp.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Testar com Dados de Exemplo</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Passagem de Turno MKTZAP</span>
            <span>•</span>
            <span>Operação & Monitoramento de Canais</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Suporta arquivos .html, .xls, .xlsx, .csv</span>
            <span>•</span>
            <span>Data automática atualizada</span>
          </div>
        </div>
      </footer>

      {/* Atendentes Modal */}
      <AtendentesModal
        isOpen={isAtendentesModalOpen}
        gvPessoas={gvPessoas}
        onClose={() => setIsAtendentesModalOpen(false)}
        onSave={handleSaveAtendentes}
      />

      {/* Floating Interactive Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
