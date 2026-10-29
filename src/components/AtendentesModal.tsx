import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, Check, RotateCcw } from 'lucide-react';
import { DEFAULT_GV_PESSOAS } from '../utils/fileParser';

interface AtendentesModalProps {
  isOpen: boolean;
  gvPessoas: string[];
  onClose: () => void;
  onSave: (newList: string[]) => void;
}

export const AtendentesModal: React.FC<AtendentesModalProps> = ({
  isOpen,
  gvPessoas,
  onClose,
  onSave,
}) => {
  const [list, setList] = useState<string[]>(gvPessoas);
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim().toUpperCase();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setNewName('');
    }
  };

  const handleRemove = (nameToRemove: string) => {
    setList(list.filter((name) => name !== nameToRemove));
  };

  const handleResetDefaults = () => {
    setList([...DEFAULT_GV_PESSOAS]);
  };

  const handleApply = () => {
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-600/40 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Equipe Experiência Brasil
              </h3>
              <p className="text-xs text-slate-400">
                Responsáveis pelo atendimento da fila Whats GV Antecipada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative banner about instant recalculation */}
        <div className="px-5 py-2.5 bg-blue-950/30 border-b border-slate-800 text-[11px] text-blue-300 flex items-center gap-2">
          <span>⚡</span>
          <span>Ao salvar, qualquer planilha aberta é recalculada automaticamente e os novos dados impactam os relatórios na hora.</span>
        </div>

        {/* Form add new */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do atendente (ex: JOÃO SILVA)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 uppercase"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </form>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2">
          {list.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">
              Nenhum responsável cadastrado.
            </p>
          ) : (
            list.map((nome) => (
              <div
                key={nome}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-200 hover:bg-slate-800/70 transition-colors"
              >
                <span className="font-medium truncate pr-2">{nome}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(nome)}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                  title="Remover atendente da lista"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-700/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
