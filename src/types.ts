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
}

export interface TopAcionamento {
  rank: number;
  nome: string;
  quantidade: number;
  percentual: number;
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
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
