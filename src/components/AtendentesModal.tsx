import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  Check, 
  RotateCcw, 
  Lock, 
  Unlock, 
  KeyRound, 
  ShieldCheck, 
  Crown,
  AlertCircle
} from 'lucide-react';
import { DEFAULT_GV_PESSOAS } from '../utils/fileParser';
import { 
  ADMIN_NAME, 
  ADMIN_EMAIL, 
  isAdminSessionValid, 
  setAdminSession 
} from '../utils/security';
import { AdminAuthModal } from './AdminAuthModal';
import { AdminChangePasswordModal } from './AdminChangePasswordModal';

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
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => isAdminSessionValid());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security Auth Dialog state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pendingActionDesc, setPendingActionDesc] = useState<string>('');

  // Change password modal
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const executeOrRequireAdmin = (actionDesc: string, action: () => void) => {
    if (isAdminSessionValid() || isAdminUnlocked) {
      action();
    } else {
      setPendingActionDesc(actionDesc);
      setPendingAction(() => action);
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAdminUnlocked(true);
    setAuthModalOpen(false);
    showToast('Acesso de Administrador (Marcio Miranda) desbloqueado com sucesso!');
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLockAdmin = () => {
    setAdminSession(false);
    setIsAdminUnlocked(false);
    showToast('Modo Administrador bloqueado com sucesso. Senha exigida para alterações.');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed) return;

    if (list.includes(trimmed)) {
      showToast('Este atendente já está cadastrado na equipe!');
      return;
    }

    executeOrRequireAdmin(`incluir "${trimmed}" na equipe`, () => {
      setList([...list, trimmed]);
      setNewName('');
      showToast(`Atendente "${trimmed}" incluído com sucesso!`);
    });
  };

  const handleRemove = (nameToRemove: string) => {
    executeOrRequireAdmin(`excluir "${nameToRemove}" da equipe`, () => {
      setList(list.filter((name) => name !== nameToRemove));
      showToast(`Atendente "${nameToRemove}" removido.`);
    });
  };

  const handleResetDefaults = () => {
    executeOrRequireAdmin('restaurar a lista padrão de atendentes', () => {
      setList([...DEFAULT_GV_PESSOAS]);
      showToast('Lista padrão de atendentes restaurada.');
    });
  };

  const handleApply = () => {
    // Check if changes were made compared to initial gvPessoas
    const isDifferent = list.length !== gvPessoas.length || list.some((item, i) => item !== gvPessoas[i]);
    if (isDifferent && !isAdminUnlocked && !isAdminSessionValid()) {
      executeOrRequireAdmin('salvar as alterações na equipe', () => {
        onSave(list);
        onClose();
      });
      return;
    }

    onSave(list);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-600/40 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Equipe Experiência Brasil
                </h3>
                <p className="text-xs text-slate-400">
                  Responsáveis pelo atendimento da fila Whats GV Antecipada
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Administrator Official Strip */}
          <div className="px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">Administrador:</span>
                  <span className="text-xs font-semibold text-white">{ADMIN_NAME}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isAdminUnlocked ? (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Modo Administrador Ativo (Desbloqueado)
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Acesso Restrito (Requer Senha)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isAdminUnlocked ? (
                <>
                  <button
                    type="button"
                    onClick={() => setChangePasswordOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    title="Defina sua própria senha pessoal"
                  >
                    <KeyRound className="w-3 h-3 text-blue-400" />
                    Alterar Senha
                  </button>
                  <button
                    type="button"
                    onClick={handleLockAdmin}
                    className="flex items-center gap-1 text-[11px] font-medium text-rose-300 hover:text-rose-100 bg-rose-500/15 hover:bg-rose-500/25 px-2.5 py-1 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                    title="Bloquear alterações"
                  >
                    <Lock className="w-3 h-3" />
                    Bloquear
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPendingActionDesc('desbloquear o acesso de administrador');
                    setPendingAction(null);
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 rounded-lg border border-emerald-500/40 transition-colors cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  Entrar como Admin
                </button>
              )}
            </div>
          </div>

          {/* Feedback Toast Banner */}
          {toastMessage && (
            <div className="px-5 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Form add new */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Incluir Atendente na Equipe:</span>
              {!isAdminUnlocked && (
                <span className="text-amber-400/90 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Pedirá a senha do administrador ao adicionar
                </span>
              )}
            </div>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do atendente (ex: MARIO SOUZA)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-1.5 min-h-[160px] max-h-[260px]">
            {list.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">
                Nenhum responsável cadastrado.
              </p>
            ) : (
              list.map((nome) => {
                const isMarcio = nome.includes('MARCIO MIRANDA');
                return (
                  <div
                    key={nome}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      isMarcio 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isMarcio ? (
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                      )}
                      <span className="font-medium font-mono truncate">{nome}</span>
                      {isMarcio && (
                        <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded shrink-0">
                          Administrador
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(nome)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                      title={isAdminUnlocked ? `Remover ${nome}` : 'Requer senha do administrador para remover'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Restaura a lista com os atendentes originais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-700/20 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Auth Modal (when locked action is performed) */}
      <AdminAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
        actionDescription={pendingActionDesc}
      />

      {/* Admin Change Password Modal */}
      <AdminChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onPasswordChanged={() => {
          showToast('Sua nova senha de administrador foi salva com sucesso!');
        }}
      />
    </>
  );
};
