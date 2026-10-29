import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Download, Search, FileText, PhoneCall, User, ShieldCheck } from 'lucide-react';
import { TopAcionamento, ProtocoloItem } from '../types';
import { saveAs } from 'file-saver';

interface ProtocolosModalProps {
  isOpen: boolean;
  acionamento: TopAcionamento | null;
  onClose: () => void;
  onShowToast: (toast: { type: 'success' | 'info' | 'error' | 'warning'; title: string; message: string }) => void;
}

export const ProtocolosModal: React.FC<ProtocolosModalProps> = ({
  isOpen,
  acionamento,
  onClose,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);

  const protocolos = acionamento?.protocolos || [];

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return protocolos;
    const term = searchTerm.toLowerCase();
    return protocolos.filter(
      (p) =>
        p.protocolo.toLowerCase().includes(term) ||
        (p.chamado && p.chamado.toLowerCase().includes(term)) ||
        (p.responsavel && p.responsavel.toLowerCase().includes(term)) ||
        (p.setor && p.setor.toLowerCase().includes(term))
    );
  }, [protocolos, searchTerm]);

  if (!isOpen || !acionamento) return null;

  const handleCopyAll = async () => {
    try {
      const textToCopy = protocolos.map((p) => p.protocolo).join('\n');
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      onShowToast({
        type: 'success',
        title: 'Protocolos Copiados!',
        message: `${protocolos.length} protocolos de "${acionamento.nome}" copiados para a área de transferência.`,
      });
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      onShowToast({
        type: 'error',
        title: 'Erro ao Copiar',
        message: 'Não foi possível acessar a área de transferência.',
      });
    }
  };

  const handleCopySingle = async (proto: string) => {
    try {
      await navigator.clipboard.writeText(proto);
      setCopiedSingle(proto);
      setTimeout(() => setCopiedSingle(null), 2000);
    } catch {}
  };

  const handleDownloadTxt = () => {
    try {
      let content = `RELATÓRIO DE PROTOCOLOS - ${acionamento.rank}º ${acionamento.nome}\n`;
      content += `Total de Casos: ${acionamento.quantidade} (${acionamento.percentual.toFixed(1)}%)\n`;
      content += `Extraído em: ${new Date().toLocaleString('pt-BR')}\n`;
      content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      protocolos.forEach((p, idx) => {
        content += `${idx + 1}. Protocolo: ${p.protocolo}\n`;
        if (p.chamado) content += `   Chamado: ${p.chamado}\n`;
        content += `   Operador: ${p.responsavel || '-'}\n`;
        content += `   Canal/Fila: ${p.setor || '-'}\n`;
        if (p.tempoOperacao) content += `   Tempo: ${p.tempoOperacao}\n`;
        content += `\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const cleanName = acionamento.nome.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      saveAs(blob, `protocolos_${acionamento.rank}_${cleanName}.txt`);

      onShowToast({
        type: 'success',
        title: 'Arquivo Baixado!',
        message: `Relatório de protocolos de "${acionamento.nome}" salvo com sucesso.`,
      });
    } catch (err: any) {
      onShowToast({
        type: 'error',
        title: 'Erro ao Baixar',
        message: err?.message || 'Falha ao gerar arquivo.',
      });
    }
  };

  const handleDownloadCsv = () => {
    try {
      let csv = 'Protocolo;Chamado;Responsavel;Canal;Tempo_Operacao\n';
      protocolos.forEach((p) => {
        csv += `"${p.protocolo}";"${p.chamado || ''}";"${p.responsavel || ''}";"${p.setor || ''}";"${p.tempoOperacao || ''}"\n`;
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const cleanName = acionamento.nome.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      saveAs(blob, `protocolos_${acionamento.rank}_${cleanName}.csv`);

      onShowToast({
        type: 'success',
        title: 'Planilha CSV Baixada!',
        message: `Arquivo CSV com os ${protocolos.length} protocolos baixado.`,
      });
    } catch (err: any) {
      onShowToast({
        type: 'error',
        title: 'Erro ao Baixar',
        message: err?.message || 'Falha ao gerar CSV.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-bold px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-400 shrink-0 font-mono-numbers">
              {acionamento.rank}º Lugar
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                {acionamento.nome}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {acionamento.quantidade} ocorrências registradas ({acionamento.percentual.toFixed(1)}% do total)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Actions */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por protocolo, atendente ou canal..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shadow-sm active:scale-98"
              title="Copiar lista de protocolos para área de transferência"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedAll ? 'Copiados!' : 'Copiar Todos'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-xl transition-all shadow-sm active:scale-98"
              title="Baixar lista em formato Excel CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-98"
              title="Baixar como arquivo de texto (.txt)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>
          </div>
        </div>

        {/* Protocols List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[460px]">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              Nenhum protocolo encontrado para a busca "{searchTerm}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono-numbers text-slate-500 w-6 shrink-0 text-right">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers font-bold text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                        {item.protocolo}
                      </span>
                      {item.chamado && (
                        <span className="text-[10px] font-mono-numbers text-blue-400 bg-blue-950/60 border border-blue-800/50 px-1.5 py-0.5 rounded">
                          Ticket: {item.chamado}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 truncate">
                      <span className="truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{item.responsavel || 'Operador'}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{item.setor}</span>
                      {item.tempoOperacao && (
                        <>
                          <span>•</span>
                          <span className="font-mono-numbers text-slate-400">{item.tempoOperacao}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(item.protocolo)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0 ml-auto sm:ml-0"
                  title="Copiar apenas este protocolo"
                >
                  {copiedSingle === item.protocolo ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>
            Mostrando <strong>{filtered.length}</strong> de {protocolos.length} protocolos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
