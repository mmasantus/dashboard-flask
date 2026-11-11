import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Download, Search, FileText, PhoneCall, User, Tag, Layers, Filter } from 'lucide-react';
import { TopAcionamento, ProtocoloItem } from '../types';
import { saveAs } from 'file-saver';
import { downloadBlobFile } from '../utils/downloadHelper';

export interface ProtocolosModalProps {
  isOpen: boolean;
  acionamento?: TopAcionamento | null;
  customTitle?: string;
  customSubtitle?: string;
  customBadge?: string;
  protocolosList?: ProtocoloItem[];
  showChannelFilter?: boolean;
  onClose: () => void;
  onShowToast: (toast: { type: 'success' | 'info' | 'error' | 'warning'; title: string; message: string }) => void;
}

export const ProtocolosModal: React.FC<ProtocolosModalProps> = ({
  isOpen,
  acionamento,
  customTitle,
  customSubtitle,
  customBadge,
  protocolosList,
  showChannelFilter = true,
  onClose,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('todos');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);

  const rawProtocolos = useMemo(() => {
    if (protocolosList && protocolosList.length > 0) {
      return protocolosList;
    }
    return acionamento?.protocolos || [];
  }, [protocolosList, acionamento]);

  const modalTitle = customTitle || acionamento?.nome || 'Detalhamento de Atendimentos';
  const modalBadge = customBadge || (acionamento ? `${acionamento.rank}º Lugar` : null);
  const modalSubtitle =
    customSubtitle ||
    (acionamento
      ? `${acionamento.quantidade} ocorrências registradas (${acionamento.percentual.toFixed(1)}% do total)`
      : `${rawProtocolos.length} registros listados`);

  // Extract unique channels for filter tabs
  const availableChannels = useMemo(() => {
    const set = new Set<string>();
    rawProtocolos.forEach((p) => {
      if (p.setor) set.add(p.setor.trim());
    });
    return Array.from(set);
  }, [rawProtocolos]);

  // Filtered protocols based on search and channel tab
  const filtered = useMemo(() => {
    return rawProtocolos.filter((p) => {
      // Channel tab filter
      if (selectedChannel !== 'todos' && p.setor !== selectedChannel) {
        return false;
      }
      // Text search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.protocolo.toLowerCase().includes(term) ||
        (p.chamado && p.chamado.toLowerCase().includes(term)) ||
        (p.responsavel && p.responsavel.toLowerCase().includes(term)) ||
        (p.setor && p.setor.toLowerCase().includes(term)) ||
        (p.tema && p.tema.toLowerCase().includes(term))
      );
    });
  }, [rawProtocolos, searchTerm, selectedChannel]);

  if (!isOpen) return null;

  const handleCopyAll = async () => {
    try {
      const textToCopy = filtered
        .map((p, idx) => {
          const chamadoStr = p.chamado ? ` | Chamado: ${p.chamado}` : '';
          const analistaStr = p.responsavel ? ` | Analista: ${p.responsavel}` : '';
          const temaStr = p.tema ? ` | Tema: ${p.tema}` : '';
          const canalStr = p.setor ? ` | Canal: ${p.setor}` : '';
          return `${idx + 1}. Protocolo: ${p.protocolo}${analistaStr}${temaStr}${canalStr}${chamadoStr}`;
        })
        .join('\n');

      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      onShowToast({
        type: 'success',
        title: 'Protocolos Copiados!',
        message: `${filtered.length} atendimentos copiados com analista, tema e canal.`,
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

  const handleCopySingle = async (p: ProtocoloItem) => {
    try {
      const text = `Protocolo: ${p.protocolo} | Analista: ${p.responsavel || '-'} | Tema: ${p.tema || '-'} | Canal: ${p.setor || '-'}${p.chamado ? ` | Ticket: ${p.chamado}` : ''}`;
      await navigator.clipboard.writeText(text);
      setCopiedSingle(p.protocolo);
      setTimeout(() => setCopiedSingle(null), 2000);
    } catch {}
  };

  const handleDownloadTxt = () => {
    try {
      let content = `RELATÓRIO DE ATENDIMENTOS E PROTOCOLOS\n`;
      content += `Título: ${modalTitle}\n`;
      content += `Total Listado: ${filtered.length} de ${rawProtocolos.length}\n`;
      content += `Extraído em: ${new Date().toLocaleString('pt-BR')}\n`;
      content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      filtered.forEach((p, idx) => {
        content += `${idx + 1}. PROTOCOLO: ${p.protocolo}\n`;
        content += `   Analista / Operador: ${p.responsavel || 'Não informado'}\n`;
        content += `   Tema / Assunto:      ${p.tema || 'Não informado'}\n`;
        content += `   Canal / Fila:        ${p.setor || 'Não informado'}\n`;
        if (p.chamado) content += `   Ticket / Chamado:    ${p.chamado}\n`;
        if (p.tempoOperacao) content += `   Tempo Operação:      ${p.tempoOperacao}\n`;
        if (p.horario) content += `   Horário de Registro: ${p.horario}\n`;
        content += `\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const cleanName = modalTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      downloadBlobFile(blob, `atendimentos_${cleanName}.txt`);

      onShowToast({
        type: 'success',
        title: 'Arquivo TXT Baixado!',
        message: `Relatório com ${filtered.length} atendimentos salvo com sucesso.`,
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
      let csv = 'Protocolo;Analista;Tema_Assunto;Canal;Chamado_Ticket;Tempo_Operacao;Horario\n';
      filtered.forEach((p) => {
        csv += `"${p.protocolo}";"${p.responsavel || ''}";"${p.tema || ''}";"${p.setor || ''}";"${p.chamado || ''}";"${p.tempoOperacao || ''}";"${p.horario || ''}"\n`;
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const cleanName = modalTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      saveAs(blob, `atendimentos_${cleanName}.csv`);

      onShowToast({
        type: 'success',
        title: 'Planilha CSV Baixada!',
        message: `Planilha com os ${filtered.length} atendimentos baixada.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {modalBadge && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-400 shrink-0 font-mono-numbers">
                {modalBadge}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {modalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Filter Tabs (if multiple channels exist) */}
        {showChannelFilter && availableChannels.length > 1 && (
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3 h-3" />
              Canal:
            </span>
            <button
              type="button"
              onClick={() => setSelectedChannel('todos')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                selectedChannel === 'todos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Todos ({rawProtocolos.length})
            </button>
            {availableChannels.map((channel) => {
              const count = rawProtocolos.filter((p) => p.setor === channel).length;
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setSelectedChannel(channel)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                    selectedChannel === channel
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {channel} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Toolbar: Search + Actions */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por protocolo, tema/assunto, analista ou chamado..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 shadow-xs transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer"
              title="Copiar lista com protocolo, analista e tema"
            >
              {copiedAll ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              )}
              <span>{copiedAll ? 'Copiados!' : 'Copiar Lista'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700/60 rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer"
              title="Baixar lista em formato Excel (.csv)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all active:scale-98 cursor-pointer"
              title="Baixar como arquivo de texto (.txt)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>
          </div>
        </div>

        {/* Protocols List with Protocolo, Analista and Tema */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 max-h-[480px] bg-slate-50/50 dark:bg-slate-900/60">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500">
              Nenhum atendimento encontrado para a busca selecionada.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <span className="text-[11px] font-mono-numbers text-slate-400 dark:text-slate-500 w-6 shrink-0 text-right mt-0.5 sm:mt-0">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0 space-y-1.5">
                    {/* Top Row: Protocol, Ticket, Sector */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-numbers font-bold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg">
                        Protocolo: {item.protocolo}
                      </span>

                      {item.chamado && (
                        <span className="text-[10px] font-mono-numbers font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-blue-500" />
                          Ticket: {item.chamado}
                        </span>
                      )}

                      {item.setor && (
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                          {item.setor}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Analista + Tema/Assunto (destaque solicitado pelo usuário) */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      {/* Analista */}
                      <span className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold bg-slate-100/80 dark:bg-slate-800/70 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/60">
                        <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Analista: {item.responsavel || 'Não informado'}</span>
                      </span>

                      {/* Tema / Assunto */}
                      {item.tema && (
                        <span className="inline-flex items-center gap-1 text-purple-800 dark:text-purple-300 font-medium bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/50">
                          <Tag className="w-3 h-3 text-purple-500 shrink-0" />
                          <span>Tema: {item.tema}</span>
                        </span>
                      )}

                      {item.tempoOperacao && (
                        <span className="text-[11px] font-mono-numbers text-slate-500 dark:text-slate-400">
                          Tempo: {item.tempoOperacao}
                        </span>
                      )}

                      {item.horario && (
                        <span className="text-[11px] font-mono-numbers text-slate-500 dark:text-slate-400">
                          • {item.horario}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Single Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopySingle(item)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shrink-0 ml-auto sm:ml-0 cursor-pointer shadow-2xs"
                  title="Copiar dados deste protocolo (protocolo, analista e tema)"
                >
                  {copiedSingle === item.protocolo ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Mostrando <strong>{filtered.length}</strong> de {rawProtocolos.length} atendimentos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
