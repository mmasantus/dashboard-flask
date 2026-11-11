import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ExecutiveMetrics } from './components/ExecutiveMetrics';
import { SectorsAnalytics } from './components/SectorsAnalytics';
import { TopAcionamentosSection } from './components/TopAcionamentosSection';
import { DocumentExportSection } from './components/DocumentExportSection';
import { AtendentesModal } from './components/AtendentesModal';
import { ProtocolosModal } from './components/ProtocolosModal';
import { GuiaModal } from './components/GuiaModal';
import { ComoFuncionaTab } from './components/ComoFuncionaTab';
import { ChannelVolumeMonitoringChart } from './components/ChannelVolumeMonitoringChart';
import { ToastContainer } from './components/Toast';
import { ProcessedReport, ToastMessage, TopAcionamento, SectorMetric, ProtocoloItem, HourlyVolumePoint } from './types';
import { parseMktzapFile, getDemoReport, processExtractedRows, DEFAULT_GV_PESSOAS } from './utils/fileParser';
import { saveAs } from 'file-saver';
import { ShieldCheck, FileSpreadsheet, Sparkles, BarChart2, Layers } from 'lucide-react';

export default function App() {
  const [report, setReport] = useState<ProcessedReport | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, any>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [protocolsModalConfig, setProtocolsModalConfig] = useState<{
    isOpen: boolean;
    acionamento?: TopAcionamento | null;
    customTitle?: string;
    customSubtitle?: string;
    customBadge?: string;
    protocolosList?: ProtocoloItem[];
    showChannelFilter?: boolean;
  }>({
    isOpen: false,
  });
  const [isGuiaModalOpen, setIsGuiaModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'como-funciona'>('dashboard');

  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('mktzap_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('mktzap_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
      setActiveTab('dashboard');
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
    setActiveTab('dashboard');
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
        message: `Planilha recalculada imediatamente com os ${newList.length} integrantes.`,
      });
    } else {
      addToast({
        type: 'success',
        title: 'Equipe Experiência Brasil Salva!',
        message: `Lista salva com ${newList.length} integrantes com controle de administrador.`,
      });
    }
  };

  const handleSelectAcionamento = (item: TopAcionamento) => {
    setProtocolsModalConfig({
      isOpen: true,
      acionamento: item,
      customTitle: `${item.rank}º Lugar - ${item.nome}`,
      customSubtitle: `${item.quantidade} ocorrências registradas (${item.percentual.toFixed(1)}% do total)`,
      customBadge: `${item.rank}º Lugar`,
      protocolosList: item.protocolos,
      showChannelFilter: true,
    });
  };

  const handleViewSectorFinalizados = (sector: SectorMetric) => {
    setProtocolsModalConfig({
      isOpen: true,
      customTitle: `Atendimentos Finalizados • ${sector.name}`,
      customSubtitle: `${sector.finalizados} atendimentos finalizados no canal (${sector.percentOfTotal.toFixed(1)}% da carga total)`,
      customBadge: `${sector.finalizados} Finalizados`,
      protocolosList: sector.protocolosFinalizados || [],
      showChannelFilter: false,
    });
  };

  const handleViewSectorChamados = (sector: SectorMetric) => {
    setProtocolsModalConfig({
      isOpen: true,
      customTitle: `Chamados e Tickets Abertos • ${sector.name}`,
      customSubtitle: `${sector.chamados} atendimentos demandaram abertura de chamado no canal ${sector.name}`,
      customBadge: `${sector.chamados} Chamados`,
      protocolosList: sector.protocolosChamados || [],
      showChannelFilter: false,
    });
  };

  const handleViewTotalFinalizados = () => {
    if (!report) return;
    setProtocolsModalConfig({
      isOpen: true,
      customTitle: `Todos os Atendimentos Finalizados (Consolidado)`,
      customSubtitle: `Total de ${report.totalFinalizados} atendimentos finalizados em todos os canais do turno`,
      customBadge: `Total: ${report.totalFinalizados}`,
      protocolosList: report.todosProtocolosFinalizados || [],
      showChannelFilter: true,
    });
  };

  const handleViewTotalChamados = () => {
    if (!report) return;
    setProtocolsModalConfig({
      isOpen: true,
      customTitle: `Todos os Chamados e Tickets Abertos`,
      customSubtitle: `${report.totalChamados} atendimentos demandaram abertura de chamado (${report.taxaGeralChamados.toFixed(1)}% de taxa geral)`,
      customBadge: `${report.totalChamados} Tickets Abertos`,
      protocolosList: report.todosProtocolosChamados || [],
      showChannelFilter: true,
    });
  };

  const handleViewAllDistribution = () => {
    if (!report) return;
    setProtocolsModalConfig({
      isOpen: true,
      customTitle: `Distribuição de Volumes por Canal de Atendimento`,
      customSubtitle: `Navegue pelas abas para filtrar por Whats GN, Whats GV, Antecipada, Franquia ou CB Commerce`,
      customBadge: `100% dos Canais`,
      protocolosList: report.todosProtocolosFinalizados || [],
      showChannelFilter: true,
    });
  };

  const handleViewTopSector = () => {
    if (!report) return;
    const list = Object.values(report.setores);
    const top = list.reduce((max, s) => (s.finalizados > max.finalizados ? s : max), list[0]);
    if (top) handleViewSectorFinalizados(top);
  };

  const handleViewPeakProtocols = (peak: {
    canal: string;
    hora: string;
    volume: number;
    protocolos?: ProtocoloItem[];
  }) => {
    if (!report) return;
    let list = peak.protocolos && peak.protocolos.length > 0 ? peak.protocolos : [];
    if (list.length === 0) {
      // Fallback: match by channel
      const normCanal = peak.canal.toLowerCase().replace('whats ', '').trim();
      list = (report.todosProtocolosFinalizados || []).filter((p) =>
        p.setor?.toLowerCase().includes(normCanal)
      );
    }

    setProtocolsModalConfig({
      isOpen: true,
      customTitle: `Pico de Volumetria • ${peak.canal} (${peak.hora})`,
      customSubtitle: `${list.length} atendimentos registrados no pico de maior concentração de demanda do turno`,
      customBadge: `Pico: ${peak.volume} casos`,
      protocolosList: list,
      showChannelFilter: true,
    });
  };

  const handleViewHourProtocols = (point: HourlyVolumePoint, channelFilter?: string) => {
    if (!report) return;
    let list = point.protocolos || [];
    if (channelFilter && channelFilter !== 'all' && channelFilter !== 'total') {
      const filterKey = channelFilter.toLowerCase().replace('whats ', '').trim();
      list = list.filter((p) => p.setor?.toLowerCase().includes(filterKey));
    }

    setProtocolsModalConfig({
      isOpen: true,
      customTitle: `Atendimentos na Faixa das ${point.hora}`,
      customSubtitle: `${list.length} casos registrados nesta faixa de horário`,
      customBadge: `${point.hora}`,
      protocolosList: list,
      showChannelFilter: true,
    });
  };

  const handleCopyAllTopProtocols = async () => {
    if (!report || report.topAcionamentos.length === 0) return;
    let text = `MKTZAP - LISTA COMPLETA DE PROTOCOLOS DOS ACIONAMENTOS\n`;
    text += `Data: ${report.dataReferencia || new Date().toLocaleDateString('pt-BR')} | Turno: ${report.periodoTurno}\n\n`;

    report.topAcionamentos.forEach((top) => {
      text += `========================================\n`;
      text += `${top.rank}º: ${top.nome} (${top.quantidade} casos - ${top.percentual.toFixed(1)}%)\n`;
      text += `========================================\n`;
      const list = top.protocolos || [];
      if (list.length === 0) {
        text += `(Nenhum protocolo extraído)\n\n`;
      } else {
        list.forEach((p) => {
          text += `${p.protocolo}${p.chamado ? ` | Chamado: ${p.chamado}` : ''}${p.responsavel ? ` | Atendente: ${p.responsavel}` : ''}\n`;
        });
        text += '\n';
      }
    });

    try {
      await navigator.clipboard.writeText(text);
      addToast({
        type: 'success',
        title: 'Protocolos Copiados!',
        message: 'Todos os protocolos registrados foram copiados para a área de transferência.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Erro ao Copiar',
        message: 'Não foi possível acessar a área de transferência.',
      });
    }
  };

  const handleDownloadAllTopProtocols = () => {
    if (!report || report.topAcionamentos.length === 0) return;
    let content = `=================================================================================\n`;
    content += `MKTZAP - PROTOCOLOS DE TODOS OS ACIONAMENTOS\n`;
    content += `Data: ${report.dataReferencia || new Date().toLocaleDateString('pt-BR')} | Turno: ${report.periodoTurno}\n`;
    content += `Total Geral de Atendimentos: ${report.totalFinalizados} | Total de Chamados: ${report.totalChamados}\n`;
    content += `=================================================================================\n\n`;

    report.topAcionamentos.forEach((top) => {
      content += `---------------------------------------------------------------------------------\n`;
      content += `${top.rank}º MOTIVO: ${top.nome}\n`;
      content += `Total de Casos: ${top.quantidade} (${top.percentual.toFixed(1)}% do total do turno)\n`;
      content += `---------------------------------------------------------------------------------\n`;

      const list = top.protocolos || [];
      if (list.length === 0) {
        content += `Nenhum protocolo detalhado encontrado.\n\n`;
      } else {
        content += `Nº\tPROTOCOLO\tCHAMADO\tATENDENTE / RESPONSÁVEL\tSETOR\tTEMPO\n`;
        list.forEach((p, idx) => {
          content += `${idx + 1}\t${p.protocolo}\t${p.chamado || '-'}\t${p.responsavel || '-'}\t${p.setor || '-'}\t${p.tempoOperacao || '-'}\n`;
        });
        content += `\nTotal: ${list.length} registros neste motivo\n\n`;
      }
    });

    content += `Gerado automaticamente via Painel Passagem de Turno MKTZAP.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const safeTurno = report.periodoTurno.replace(/[^a-zA-Z0-9]/g, '_');
    saveAs(blob, `Protocolos_Todos_Acionamentos_${safeTurno}.txt`);

    addToast({
      type: 'success',
      title: 'Download Concluído!',
      message: 'Arquivo TXT com todos os protocolos baixado com sucesso.',
    });
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#090d14] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
      } flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200`}
    >
      {/* Top Header */}
      <Header
        hasData={!!report}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        onLoadDemo={handleLoadDemo}
        onClearData={handleClearData}
        onOpenAtendentes={() => setIsAtendentesModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12">
        {activeTab === 'como-funciona' ? (
          /* Como Funciona Tab View */
          <ComoFuncionaTab
            onGoToDashboard={() => setActiveTab('dashboard')}
            onOpenAtendentes={() => setIsAtendentesModalOpen(true)}
          />
        ) : (
          /* Dashboard Tab View */
          <>
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
              <div className="space-y-12 animate-in fade-in duration-300">
                {/* 1. Painel de Monitorização - Curva de Volumetria dos Canais com Pico (Posicionado no Topo) */}
                <section aria-label="Monitoramento de Volumetria e Fluxo dos Canais">
                  <ChannelVolumeMonitoringChart
                    report={report}
                    onViewPeakProtocols={handleViewPeakProtocols}
                    onViewHourProtocols={handleViewHourProtocols}
                  />
                </section>

                {/* 2. Executive Summary Strip (KPI Cards - Clickable for protocols) */}
                <section aria-label="Resumo Executivo do Turno">
                  <ExecutiveMetrics
                    report={report}
                    onViewTotalFinalizados={handleViewTotalFinalizados}
                    onViewTotalChamados={handleViewTotalChamados}
                    onViewTopSector={handleViewTopSector}
                  />
                </section>

                {/* 3. Interactive Sectors Analytics Matrix & Volume Donut (Clickable channels) */}
                <section aria-label="Consolidação por Canais">
                  <SectorsAnalytics
                    report={report}
                    onUpdatePendencias={handleUpdatePendencias}
                    onViewSectorFinalizados={handleViewSectorFinalizados}
                    onViewSectorChamados={handleViewSectorChamados}
                    onViewAllDistribution={handleViewAllDistribution}
                  />
                </section>

                {/* 4. Dual Grid: Top Acionamentos + Official Word & WhatsApp Export */}
                <section aria-label="Detalhamento Operacional e Exportação" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                  {/* Left Column: Top Acionamentos (6 cols) */}
                  <div className="lg:col-span-6">
                    <TopAcionamentosSection
                      topAcionamentos={report.topAcionamentos}
                      demaisCount={report.demaisAcionamentosCount}
                      demaisCasos={report.demaisAcionamentosCasos}
                      onSelectAcionamento={handleSelectAcionamento}
                      onCopyAllTopProtocols={handleCopyAllTopProtocols}
                      onDownloadAllTopProtocols={handleDownloadAllTopProtocols}
                    />
                  </div>

                  {/* Right Column: Exportação Word & WhatsApp (6 cols) */}
                  <div className="lg:col-span-6">
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
              <div className="py-12 px-6 rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] text-center max-w-3xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-5 shadow-md shadow-emerald-500/10">
                  <Sparkles className="w-7 h-7" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Painel de Passagem de Turno MKTZAP
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 max-w-xl mx-auto leading-relaxed">
                  Carregue a planilha extraída do sistema para consolidar automaticamente os atendimentos
                  finalizados, contagem de chamados, taxa de acionamento por fila e gerar a ata em Word (.docx).
                </p>

                {/* 3 Quick highlights */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                      <BarChart2 className="w-4 h-4 shrink-0" />
                      <span>Consolidação por Canais</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Calcula Whats GN, Whats GV, GV Antecipada, Franquia e CB Commerce com precisão.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
                      <Layers className="w-4 h-4 shrink-0" />
                      <span>Todos os Acionamentos</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ranking completo com porcentagens, visualizador e exportação de protocolos.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
                      <FileSpreadsheet className="w-4 h-4 shrink-0" />
                      <span>Exportação Oficial</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Download do documento Word (.docx) padronizado ou cópia rápida para o WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadDemo}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Testar com Dados de Exemplo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('como-funciona')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <span>Ver Como Funciona</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer com maior amplitude e informações centralizadas */}
      <footer className="border-t border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#090d16] mt-auto py-12 sm:py-16 transition-colors shadow-xs dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Passagem de Turno MKTZAP
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Painel operacional para consolidação automática de relatórios, acompanhamento de volumetria dos canais, auditoria de protocolos e exportação de atas de turno.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span>© {new Date().getFullYear()} Desenvolvido por Marcio Miranda. Todos os direitos reservados.</span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
              🔒 Processamento seguro 100% local no navegador
            </span>
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

      {/* Universal Protocolos Modal (Top Acionamentos, Canais, Finalizados, Chamados, Distribuição) */}
      <ProtocolosModal
        isOpen={protocolsModalConfig.isOpen}
        acionamento={protocolsModalConfig.acionamento}
        customTitle={protocolsModalConfig.customTitle}
        customSubtitle={protocolsModalConfig.customSubtitle}
        customBadge={protocolsModalConfig.customBadge}
        protocolosList={protocolsModalConfig.protocolosList}
        showChannelFilter={protocolsModalConfig.showChannelFilter}
        onClose={() => setProtocolsModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onShowToast={addToast}
      />

      {/* Guia Modal */}
      <GuiaModal
        isOpen={isGuiaModalOpen}
        onClose={() => setIsGuiaModalOpen(false)}
      />

      {/* Floating Interactive Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
