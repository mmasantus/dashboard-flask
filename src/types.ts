export interface ProtocoloItem {
  protocolo: string;
  chamado?: string;
  responsavel?: string; // Nome do analista
  setor?: string;       // Canal de atendimento
  tempoOperacao?: string;
  tema?: string;        // Assunto / Função do Sistema (ex: ACESSO)
  horario?: string;     // Hora de abertura/atendimento
  intervaloHora?: string; // ex: '14h-16h'
}

export interface SectorMetric {
  id: string;
  name: string;
  shortName: string;
  finalizados: number;
  chamados: number;
  pendencias: number;
  taxaChamados: number;
  percentOfTotal: number;
  accentColor: string;
  textColor: string;
  protocolosFinalizados?: ProtocoloItem[];
  protocolosChamados?: ProtocoloItem[];
}

export interface TopAcionamento {
  rank: number;
  nome: string;
  quantidade: number;
  percentual: number;
  protocolos: ProtocoloItem[];
}

export interface HourlyVolumePoint {
  hora: string;
  total: number;
  gn: number;
  gv: number;
  gv_antecipada: number;
  franquia: number;
  cb_commerce: number;
  protocolos?: ProtocoloItem[];
}

export interface ProcessedReport {
  filename: string;
  uploadDate: Date;
  periodoTurno: string;
  dataReferencia: string;
  totalFinalizados: number;
  totalChamados: number;
  totalPendencias: number;
  taxaGeralChamados: number;
  setores: Record<string, SectorMetric>;
  topAcionamentos: TopAcionamento[];
  demaisAcionamentosCount: number;
  demaisAcionamentosCasos: number;
  totalLinhasBrutas: number;
  linhasNaoFinalizadas: number;
  todosProtocolosFinalizados?: ProtocoloItem[];
  todosProtocolosChamados?: ProtocoloItem[];
  hourlyDistribution?: HourlyVolumePoint[];
  picoVolumetria?: {
    canal: string;
    hora: string;
    volume: number;
    cor: string;
    protocolos?: ProtocoloItem[];
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
