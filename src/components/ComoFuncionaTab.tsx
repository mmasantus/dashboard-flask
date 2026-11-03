import React from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Crown,
  Share2,
  FileDown,
  ShieldCheck,
  Eye,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Download,
  Users,
  FolderArchive,
  ExternalLink
} from 'lucide-react';
import { generateAndDownloadGuidePdf } from '../utils/pdfGenerator';
import { downloadPublicFile } from '../utils/downloadHelper';
import { ADMIN_NAME } from '../utils/security';

interface ComoFuncionaTabProps {
  onGoToDashboard: () => void;
  onOpenAtendentes: () => void;
}

export const ComoFuncionaTab: React.FC<ComoFuncionaTabProps> = ({
  onGoToDashboard,
  onOpenAtendentes,
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadGuidePdf();
    } catch (err) {
      console.error('Error generating PDF:', err);
      downloadPublicFile('/Guia_Passo_a_Passo_MKTZAP.pdf', 'Guia_Passo_a_Passo_MKTZAP.pdf');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadZip = () => {
    downloadPublicFile('/projeto_mktzap_github_vercel.zip', 'projeto_mktzap_github_vercel.zip');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-blue-500/10 dark:from-emerald-950/40 dark:via-slate-900/70 dark:to-blue-950/30 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manual do Usuário • Guia de Usabilidade</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Como funciona a Passagem de Turno MKTZAP
          </h2>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Este sistema foi criado para tornar a sua troca de turno ágil, precisa e sem retrabalho manual.
            Em poucos segundos, ele lê o relatório bruto do MKTZAP, organiza as métricas de cada canal,
            identifica os principais motivos de atendimento e entrega a ata pronta para o WhatsApp e Word (.docx).
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ir para o Painel e Carregar Planilha</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>{isDownloading ? 'Gerando...' : 'Baixar Manual Completo em PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Step Visual Flow */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span>Passo a Passo de Utilização</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs mb-3 border border-emerald-300 dark:border-emerald-800/50">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Exportar Relatório no MKTZAP
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                No MKTZAP, acesse a tela de Relatórios e exporte os atendimentos do seu turno.
                O sistema aceita arquivos nos formatos <strong>.html</strong>, <strong>.xls</strong>, <strong>.xlsx</strong> e <strong>.csv</strong>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Filtra finalizados automaticamente
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all">
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center text-xs mb-3 border border-blue-300 dark:border-blue-800/50">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Carregar no Painel
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Basta arrastar a planilha para a área pontilhada da tela inicial ou clicar no botão de upload.
                O cálculo é feito instantaneamente na memória do seu navegador.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              ⚡ Processamento em menos de 1 segundo
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all">
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 font-bold flex items-center justify-center text-xs mb-3 border border-purple-300 dark:border-purple-800/50">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Consolidação dos 5 Canais
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                O painel separa as finalizações e chamados por canal:
                <strong> Whats GN</strong>, <strong>Whats GV</strong>, <strong>Whats GV Antecipada</strong> (Experiência Brasil),
                <strong> Whats Franquia</strong> e <strong>Whats CB Commerce</strong>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              📊 Gráfico circular e percentuais em tempo real
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all">
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-xs mb-3 border border-amber-300 dark:border-amber-800/50">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Ver e Baixar Protocolos
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Na lista de Acionamentos, clique sobre qualquer motivo para abrir a relação de protocolos,
                com nome do atendente, horário e número do chamado, podendo copiar ou baixar em TXT.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              🔍 Rastreabilidade de cada caso
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between md:col-span-2 lg:col-span-2 transition-all">
            <div>
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 font-bold flex items-center justify-center text-xs mb-3 border border-teal-300 dark:border-teal-800/50">
                5
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Exportar para WhatsApp e Word (.docx)
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Com apenas 1 clique você copia a Ata completa formatada para colar no grupo do WhatsApp
                ou faz o download do arquivo executivo em Word (.docx), contendo os 5 canais e os Top 3 motivos oficiais.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
              📋 1 clique para WhatsApp e 1 clique para Word
            </div>
          </div>
        </div>
      </div>

      {/* Security and Admin Highlight */}
      <div className="p-6 rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-500/40">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Controle Restrito • Equipe Experiência Brasil</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono">
                  Admin: {ADMIN_NAME}
                </span>
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                A fila <strong>Whats GV Antecipada</strong> é filtrada exclusivamente pelos membros da Equipe Experiência Brasil.
                Para garantir a integridade dos dados, inclusões e exclusões de atendentes são protegidas por senha master,
                sendo gerenciadas de forma restrita pelo administrador.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAtendentes}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700/60 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/60 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Ver Equipe
          </button>
        </div>
      </div>

      {/* Deploy GitHub & Vercel - Download ZIP */}
      <div className="p-6 rounded-3xl border border-sky-300 dark:border-sky-500/30 bg-sky-50/60 dark:bg-sky-950/20 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-300 dark:border-sky-500/40">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Baixar Projeto Completo (.ZIP) para GitHub & Vercel</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-200/60 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 font-mono">
                  Pronto para Deploy
                </span>
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Todos os arquivos foram limpos e configurados (com <code>vercel.json</code>, <code>package.json</code> e <code>.gitignore</code>).
                Clique no botão ao lado para baixar o arquivo <strong>projeto_mktzap_github_vercel.zip</strong> direto para o seu computador.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadZip}
              className="px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-98 rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo .ZIP</span>
            </button>
            <a
              href="/projeto_mktzap_github_vercel.zip"
              download="projeto_mktzap_github_vercel.zip"
              className="px-3.5 py-2.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-white dark:bg-sky-950/50 hover:bg-sky-50 dark:hover:bg-sky-900/40 border border-sky-300 dark:border-sky-700/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Link Direto</span>
            </a>
          </div>
        </div>
      </div>

      {/* Privacy and Security Guarantee */}
      <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-500/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Segurança e Privacidade Absoluta dos Seus Dados
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O processamento da sua planilha é 100% executado dentro da memória do seu próprio navegador.
              Nenhum dado de cliente, protocolo, conversa ou relatório do MKTZAP é gravado em servidores externos
              ou transmitido pela internet. O site é totalmente livre de rastreadores invasivos e resistente a vazamentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
