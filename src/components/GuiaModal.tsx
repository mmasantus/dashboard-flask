import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Crown, 
  FileSpreadsheet, 
  Share2, 
  FileText, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { generateAndDownloadGuidePdf } from '../utils/pdfGenerator';
import { downloadPublicFile } from '../utils/downloadHelper';
import { ADMIN_NAME, ADMIN_EMAIL } from '../utils/security';

interface GuiaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuiaModal: React.FC<GuiaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'seguranca' | 'exportacao'>('geral');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadGuidePdf();
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback: try direct public link download
      downloadPublicFile('/Guia_Passo_a_Passo_MKTZAP.pdf', 'Guia_Passo_a_Passo_MKTZAP.pdf');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Guia Operacional Passo a Passo
              </h3>
              <p className="text-xs text-slate-400">
                Manual de uso do Sistema de Passagem de Turno MKTZAP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              title="Baixar arquivo oficial em formato PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-950/30 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTab === 'geral'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Como Funciona o Sistema
          </button>
          <button
            onClick={() => setActiveTab('seguranca')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTab === 'seguranca'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Equipe & Senha do Admin
          </button>
          <button
            onClick={() => setActiveTab('exportacao')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTab === 'exportacao'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. WhatsApp & Arquivo Word
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'geral' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-emerald-400 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">1</span>
                  Exportar a Planilha do MKTZAP
                </div>
                <p className="text-slate-300 text-xs mb-2">
                  No painel do MKTZAP, acerte o período do seu turno e exporte o relatório de atendimentos.
                </p>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300">.html / .htm</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300">.xlsx / .xls</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">.csv</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-blue-400 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px]">2</span>
                  Carregar o Arquivo no Sistema
                </div>
                <p className="text-slate-300 text-xs">
                  Arraste e solte o arquivo na área pontilhada da tela inicial ou clique em <strong>"Escolher Arquivo no Computador"</strong>. O sistema processa tudo em menos de 1 segundo de forma local e segura.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-purple-400 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[11px]">3</span>
                  Os 5 Canais Consolidados Automaticamente
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <strong>Whats GN:</strong> Atendimentos destinados à fila GN.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <strong>Whats GV:</strong> Atendimentos destinados à fila GV geral.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <strong>Whats GV Antecipada:</strong> Atendimentos filtrados pela <em>Equipe Experiência Brasil</em>.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <strong>Whats Franquia:</strong> Atendimentos do canal Franquia.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <strong>Whats CB Commerce:</strong> Atendimentos do canal Commerce.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Admin Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Administrador Oficial: {ADMIN_NAME}
                </div>
                <p className="text-xs text-slate-300">
                  Apenas o administrador <strong>Marcio Miranda</strong> tem permissão restrita para incluir ou excluir integrantes da equipe Experiência Brasil.
                </p>
              </div>

              {/* Rules */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Senha Master de Administrador:</strong>
                    A senha padrão inicial é <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded font-mono">admin123</code>. Qualquer tentativa de adicionar, excluir ou restaurar padrão exige a confirmação desta senha.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Alteração de Senha:</strong>
                    Marcio Miranda pode clicar no botão <strong>"Alterar Senha"</strong> a qualquer momento dentro do modal para definir sua própria senha confidencial exclusiva.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Recálculo Instantâneo da Planilha:</strong>
                    Ao salvar ou alterar integrantes com a senha de admin, qualquer planilha aberta na tela recalcula imediatamente a fila Whats GV Antecipada, a taxa de chamados e a Ata Word!
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exportacao' && (
            <div className="space-y-4 animate-in fade-in">
              {/* WhatsApp Box */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-emerald-400 text-xs sm:text-sm">
                  <Share2 className="w-4 h-4" />
                  Botão "Copiar para WhatsApp"
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  Com 1 único clique, o sistema copia a mensagem estruturada com todos os marcadores operacionais, horário do turno e data, pronta para colar no grupo da operação.
                </p>
                <div className="p-2.5 bg-[#05080e] rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                  📋 Passagem de Turno MKTZAP<br />
                  🕗 08h às 16h | 📅 29/10/2026<br />
                  📲 Whats GN: ✅ Fin: 15 | ⚙️ Cha: 02 | ⚠️ Pen: 00 ...
                </div>
              </div>

              {/* Word Box */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-blue-400 text-xs sm:text-sm">
                  <FileText className="w-4 h-4" />
                  Botão "Baixar Arquivo Word (.docx)"
                </div>
                <p className="text-xs text-slate-300">
                  Gera e baixa um arquivo oficial formatado no padrão Microsoft Word (.docx), com cabeçalho corporativo, divisão formal e espaçamentos adequados para envio por e-mail ou arquivamento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Dúvidas? Fale com {ADMIN_NAME} ({ADMIN_EMAIL})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Gerando...' : 'Baixar Manual em PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
