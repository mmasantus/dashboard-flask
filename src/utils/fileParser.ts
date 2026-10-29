import * as XLSX from 'xlsx';
import { ProcessedReport, SectorMetric, TopAcionamento, ProtocoloItem } from '../types';

export const DEFAULT_GV_PESSOAS = [
  'RAFAELLA CRISTINY JACINTO CAMILO',
  'VANESSA DUARTE',
  'MARCIO MIRANDA ALVES DOS SANTOS',
  'WILLIANE BORGES',
  'LUIS GUILHERME TEODORO DOS SANTOS',
  'ADRIANA CONCEICAO DE OLIVEIRA',
  'DANIELA COELHO',
];

export const SUPPORTED_EXTENSIONS = ['.xls', '.xlsx', '.html', '.htm', '.csv', '.tsv', '.txt'];

function normalizeText(text: any): string {
  if (text === null || text === undefined) return '';
  return String(text).trim().toUpperCase();
}

function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function isValidFileFormat(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function formatCurrentDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getAutoShiftPeriod(): string {
  const currentHour = new Date().getHours();
  // Se estiver inserindo à noite depois das 18h00 coloca "08h às 00h", se for tarde coloca "08h às 16h"
  return currentHour >= 18 ? '08h às 00h' : '08h às 16h';
}

export async function parseMktzapFile(
  file: File,
  gvPessoas: string[] = DEFAULT_GV_PESSOAS,
  shiftPeriod: string = getAutoShiftPeriod()
): Promise<{ report: ProcessedReport; rows: Record<string, any>[] }> {
  const fileName = file.name;

  if (!isValidFileFormat(fileName)) {
    throw new Error(
      `Formato de arquivo não suportado (".${fileName.split('.').pop()}"). Os formatos aceitos são: .xls, .xlsx, .html ou .csv.`
    );
  }

  let rows: Record<string, any>[] = [];

  const isHtml = fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm');
  const isXlsOrCsv = fileName.toLowerCase().endsWith('.xls') ||
                     fileName.toLowerCase().endsWith('.xlsx') ||
                     fileName.toLowerCase().endsWith('.csv') ||
                     fileName.toLowerCase().endsWith('.tsv') ||
                     fileName.toLowerCase().endsWith('.txt');

  // Try text/HTML first if it starts with HTML or is .html, or fallback to SheetJS
  const fileBuffer = await file.arrayBuffer();
  const textSample = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer.slice(0, 1024));
  const isActuallyHtmlTable = textSample.includes('<table') || textSample.includes('<html') || isHtml;

  if (isActuallyHtmlTable) {
    try {
      const fullText = new TextDecoder('utf-8').decode(fileBuffer);
      rows = parseHtmlTable(fullText);
    } catch {
      // If DOMParser failed or returned empty, try XLSX read as fallback
      rows = parseWithSheetJS(fileBuffer);
    }
  } else if (isXlsOrCsv) {
    rows = parseWithSheetJS(fileBuffer);
  } else {
    throw new Error('Não foi possível ler os dados do arquivo selecionado.');
  }

  if (!rows || rows.length === 0) {
    throw new Error('Nenhuma linha de dados encontrada na planilha informada.');
  }

  const report = processExtractedRows(rows, fileName, gvPessoas, shiftPeriod);
  return { report, rows };
}

function parseHtmlTable(htmlContent: string): Record<string, any>[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const table = doc.querySelector('table');

  if (!table) {
    throw new Error('Nenhuma tabela HTML encontrada no arquivo.');
  }

  const trs = Array.from(table.querySelectorAll('tr'));
  if (trs.length < 2) {
    throw new Error('A tabela contém linhas insuficientes para processamento.');
  }

  // Detect which row contains the headers (row 0 or row 1 like python app.py df.iloc[1])
  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(trs.length, 5); i++) {
    const cells = Array.from(trs[i].querySelectorAll('th, td')).map((c) => (c.textContent || '').trim());
    const rowStr = cells.map((c) => stripAccents(c.toUpperCase())).join(' | ');

    if (
      rowStr.includes('TEMPO DE OPERACAO') ||
      rowStr.includes('SETOR FIM') ||
      rowStr.includes('RESPONSAVEL') ||
      rowStr.includes('FUNCAO DO SISTEMA')
    ) {
      headerIndex = i;
      headers = cells;
      break;
    }
  }

  // If not explicitly detected, assume row 1 (as in python app.py) or row 0
  if (headerIndex === -1) {
    if (trs.length > 2) {
      headerIndex = 1;
      headers = Array.from(trs[1].querySelectorAll('th, td')).map((c) => (c.textContent || '').trim());
    } else {
      headerIndex = 0;
      headers = Array.from(trs[0].querySelectorAll('th, td')).map((c) => (c.textContent || '').trim());
    }
  }

  const result: Record<string, any>[] = [];

  for (let i = headerIndex + 1; i < trs.length; i++) {
    const cells = Array.from(trs[i].querySelectorAll('td, th')).map((c) => (c.textContent || '').trim());
    if (cells.length === 0 || cells.every((c) => c === '')) continue;

    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      if (h) {
        rowObj[h] = cells[idx] ?? '';
      } else {
        rowObj[`col_${idx}`] = cells[idx] ?? '';
      }
    });
    result.push(rowObj);
  }

  return result;
}

function parseWithSheetJS(arrayBuffer: ArrayBuffer): Record<string, any>[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('A planilha está vazia.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawData || rawData.length < 2) {
    throw new Error('A planilha contém dados insuficientes.');
  }

  // Find header row
  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(rawData.length, 6); i++) {
    const row = rawData[i] || [];
    const rowStr = row.map((c) => stripAccents(normalizeText(c))).join(' | ');

    if (
      rowStr.includes('TEMPO DE OPERACAO') ||
      rowStr.includes('SETOR FIM') ||
      rowStr.includes('RESPONSAVEL') ||
      rowStr.includes('FUNCAO DO SISTEMA')
    ) {
      headerIndex = i;
      headers = row.map((c) => String(c || '').trim());
      break;
    }
  }

  if (headerIndex === -1) {
    headerIndex = rawData.length > 2 ? 1 : 0;
    headers = (rawData[headerIndex] || []).map((c) => String(c || '').trim());
  }

  const result: Record<string, any>[] = [];

  for (let i = headerIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0 || row.every((c: any) => c === '' || c === null || c === undefined)) {
      continue;
    }

    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const key = h || `col_${idx}`;
      rowObj[key] = row[idx] ?? '';
    });
    result.push(rowObj);
  }

  return result;
}

function findColumnValue(row: Record<string, any>, possibleNames: string[]): any {
  const keys = Object.keys(row);
  for (const name of possibleNames) {
    const normSearch = stripAccents(name.trim().toUpperCase());
    const matchingKey = keys.find((k) => stripAccents(k.trim().toUpperCase()) === normSearch);
    if (matchingKey) return row[matchingKey];
  }
  // Partial search if exact match wasn't found
  for (const name of possibleNames) {
    const normSearch = stripAccents(name.trim().toUpperCase());
    const matchingKey = keys.find((k) => stripAccents(k.trim().toUpperCase()).includes(normSearch));
    if (matchingKey) return row[matchingKey];
  }
  return '';
}

function isChamadoFilled(val: any): boolean {
  if (val === null || val === undefined) return false;
  const str = String(val).trim().toUpperCase();
  if (str === '' || str === 'NAN' || str === '-' || str === '0' || str === 'NÃO' || str === 'NAO' || str === 'NULL') {
    return false;
  }
  return true;
}

export function processExtractedRows(
  rows: Record<string, any>[],
  fileName: string,
  gvPessoas: string[] = DEFAULT_GV_PESSOAS,
  shiftPeriod: string = getAutoShiftPeriod()
): ProcessedReport {
  const normGvPessoas = gvPessoas.map((p) => stripAccents(p.trim().toUpperCase()));

  let totalLinhasBrutas = rows.length;
  let linhasNaoFinalizadas = 0;

  // Filter finalized rows (Tempo de Operação != 'NÃO FINALIZADO')
  const finalizadosRows: Record<string, any>[] = [];

  for (const row of rows) {
    const tempoOperacao = normalizeText(
      findColumnValue(row, ['Tempo de Operação', 'Tempo de Operacao', 'Tempo de Operação:', 'Status'])
    );
    const normTempo = stripAccents(tempoOperacao);

    if (normTempo.includes('NAO FINALIZADO') || normTempo === 'CANCELADO') {
      linhasNaoFinalizadas++;
    } else {
      finalizadosRows.push(row);
    }
  }

  const setorCounts: Record<string, { finalizados: number; chamados: number }> = {
    gn: { finalizados: 0, chamados: 0 },
    gv: { finalizados: 0, chamados: 0 },
    gv_antecipada: { finalizados: 0, chamados: 0 },
    franquia: { finalizados: 0, chamados: 0 },
    cb_commerce: { finalizados: 0, chamados: 0 },
  };

  const acionamentosMap = new Map<string, { quantidade: number; protocolos: ProtocoloItem[] }>();

  for (let rowIdx = 0; rowIdx < finalizadosRows.length; rowIdx++) {
    const row = finalizadosRows[rowIdx];
    const setorFimRaw = String(
      findColumnValue(row, ['Setor Fim', 'Setor', 'Fila', 'Setor Fim:']) || ''
    ).trim();
    const responsavelRaw = normalizeText(
      findColumnValue(row, ['Responsável', 'Responsavel', 'Operador', 'Atendente'])
    );
    const chamadoVal = findColumnValue(row, ['CHAMADO', 'Chamado', 'Ticket', 'Protocolo']);
    const funcaoSistemaRaw = normalizeText(
      findColumnValue(row, ['Função do Sistema', 'Funcao do Sistema', 'Função', 'Funcao', 'Motivo'])
    );

    const normSetorFim = stripAccents(setorFimRaw.toUpperCase());
    const normResp = stripAccents(responsavelRaw);
    const hasChamado = isChamadoFilled(chamadoVal);

    let categorizedSetor: string | null = null;

    // Check GV Antecipada logic first:
    // (df_finalizados["Setor Fim"] == "Atend. - GV Antecipada") & (df_finalizados["Responsável"].isin(gv_pessoas))
    if (
      (normSetorFim.includes('GV ANTECIPADA') || normSetorFim.includes('ANTECIPADA')) &&
      normGvPessoas.some((person) => normResp.includes(person) || person.includes(normResp))
    ) {
      categorizedSetor = 'gv_antecipada';
      setorCounts.gv_antecipada.finalizados++;
      if (hasChamado) setorCounts.gv_antecipada.chamados++;
    } else if (normSetorFim === 'WHATS GN' || normSetorFim.includes('WHATS GN')) {
      categorizedSetor = 'gn';
      setorCounts.gn.finalizados++;
      if (hasChamado) setorCounts.gn.chamados++;
    } else if (normSetorFim === 'WHATS GV' || (normSetorFim.includes('GV') && !normSetorFim.includes('ANTECIPADA'))) {
      categorizedSetor = 'gv';
      setorCounts.gv.finalizados++;
      if (hasChamado) setorCounts.gv.chamados++;
    } else if (normSetorFim.includes('FRANQUIA')) {
      categorizedSetor = 'franquia';
      setorCounts.franquia.finalizados++;
      if (hasChamado) setorCounts.franquia.chamados++;
    } else if (normSetorFim.includes('CB COMMERCE') || normSetorFim.includes('COMMERCE')) {
      categorizedSetor = 'cb_commerce';
      setorCounts.cb_commerce.finalizados++;
      if (hasChamado) setorCounts.cb_commerce.chamados++;
    }

    // Top acionamentos: calculated from the filtered sectors dataset as in original app.py:
    if (categorizedSetor) {
      const funcaoClean = funcaoSistemaRaw || 'NÃO ESPECIFICADO';
      const protoVal = String(
        findColumnValue(row, ['Protocolo', 'Nº Protocolo', 'Protocolo:', 'Atendimento', 'Nº Atendimento', 'Conversa', 'ID', 'CHAMADO', 'Chamado']) || ''
      ).trim();
      const protoItem: ProtocoloItem = {
        protocolo: protoVal || `Atendimento #${rowIdx + 1}`,
        chamado: chamadoVal ? String(chamadoVal).trim() : '',
        responsavel: responsavelRaw || 'Não informado',
        setor: setorFimRaw || categorizedSetor,
        tempoOperacao: String(findColumnValue(row, ['Tempo de Operação', 'Tempo de Operacao', 'Status']) || '').trim(),
      };

      const entry = acionamentosMap.get(funcaoClean) || { quantidade: 0, protocolos: [] };
      entry.quantidade++;
      entry.protocolos.push(protoItem);
      acionamentosMap.set(funcaoClean, entry);
    }
  }

  const totalFinalizados = Object.values(setorCounts).reduce((acc, curr) => acc + curr.finalizados, 0);
  const totalChamados = Object.values(setorCounts).reduce((acc, curr) => acc + curr.chamados, 0);
  const taxaGeralChamados = totalFinalizados > 0 ? (totalChamados / totalFinalizados) * 100 : 0;

  // Build sector metrics object
  const setores: Record<string, SectorMetric> = {
    gn: {
      id: 'gn',
      name: 'Whats GN',
      shortName: 'GN',
      finalizados: setorCounts.gn.finalizados,
      chamados: setorCounts.gn.chamados,
      pendencias: 0,
      taxaChamados: setorCounts.gn.finalizados > 0 ? (setorCounts.gn.chamados / setorCounts.gn.finalizados) * 100 : 0,
      percentOfTotal: totalFinalizados > 0 ? (setorCounts.gn.finalizados / totalFinalizados) * 100 : 0,
      accentColor: '#10b981', // emerald
      textColor: 'text-emerald-400',
    },
    gv: {
      id: 'gv',
      name: 'Whats GV',
      shortName: 'GV',
      finalizados: setorCounts.gv.finalizados,
      chamados: setorCounts.gv.chamados,
      pendencias: 0,
      taxaChamados: setorCounts.gv.finalizados > 0 ? (setorCounts.gv.chamados / setorCounts.gv.finalizados) * 100 : 0,
      percentOfTotal: totalFinalizados > 0 ? (setorCounts.gv.finalizados / totalFinalizados) * 100 : 0,
      accentColor: '#3b82f6', // blue
      textColor: 'text-blue-400',
    },
    gv_antecipada: {
      id: 'gv_antecipada',
      name: 'Whats GV Antecipada',
      shortName: 'GV Antecipada',
      finalizados: setorCounts.gv_antecipada.finalizados,
      chamados: setorCounts.gv_antecipada.chamados,
      pendencias: 0,
      taxaChamados:
        setorCounts.gv_antecipada.finalizados > 0
          ? (setorCounts.gv_antecipada.chamados / setorCounts.gv_antecipada.finalizados) * 100
          : 0,
      percentOfTotal: totalFinalizados > 0 ? (setorCounts.gv_antecipada.finalizados / totalFinalizados) * 100 : 0,
      accentColor: '#8b5cf6', // purple
      textColor: 'text-purple-400',
    },
    franquia: {
      id: 'franquia',
      name: 'Whats Franquia',
      shortName: 'Franquia',
      finalizados: setorCounts.franquia.finalizados,
      chamados: setorCounts.franquia.chamados,
      pendencias: 0,
      taxaChamados:
        setorCounts.franquia.finalizados > 0
          ? (setorCounts.franquia.chamados / setorCounts.franquia.finalizados) * 100
          : 0,
      percentOfTotal: totalFinalizados > 0 ? (setorCounts.franquia.finalizados / totalFinalizados) * 100 : 0,
      accentColor: '#f59e0b', // amber
      textColor: 'text-amber-400',
    },
    cb_commerce: {
      id: 'cb_commerce',
      name: 'Whats CB Commerce',
      shortName: 'CB Commerce',
      finalizados: setorCounts.cb_commerce.finalizados,
      chamados: setorCounts.cb_commerce.chamados,
      pendencias: 0,
      taxaChamados:
        setorCounts.cb_commerce.finalizados > 0
          ? (setorCounts.cb_commerce.chamados / setorCounts.cb_commerce.finalizados) * 100
          : 0,
      percentOfTotal: totalFinalizados > 0 ? (setorCounts.cb_commerce.finalizados / totalFinalizados) * 100 : 0,
      accentColor: '#06b6d4', // cyan
      textColor: 'text-cyan-400',
    },
  };

  // Sort top acionamentos
  const sortedAcionamentos = Array.from(acionamentosMap.entries())
    .map(([nome, data]) => ({ nome, quantidade: data.quantidade, protocolos: data.protocolos }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const totalAcionamentosCount = sortedAcionamentos.reduce((acc, curr) => acc + curr.quantidade, 0);

  const top3 = sortedAcionamentos.slice(0, 3);
  const demais = sortedAcionamentos.slice(3);
  const demaisCasos = demais.reduce((acc, curr) => acc + curr.quantidade, 0);

  const topAcionamentos: TopAcionamento[] = top3.map((item, idx) => ({
    rank: idx + 1,
    nome: item.nome,
    quantidade: item.quantidade,
    percentual: totalAcionamentosCount > 0 ? (item.quantidade / totalAcionamentosCount) * 100 : 0,
    protocolos: item.protocolos,
  }));

  return {
    filename: fileName,
    uploadDate: new Date(),
    periodoTurno: shiftPeriod,
    dataReferencia: formatCurrentDate(),
    totalFinalizados,
    totalChamados,
    totalPendencias: 0,
    taxaGeralChamados,
    setores,
    topAcionamentos,
    demaisAcionamentosCount: demais.length,
    demaisAcionamentosCasos: demaisCasos,
    totalLinhasBrutas,
    linhasNaoFinalizadas,
  };
}

export function getDemoReport(): ProcessedReport {
  const setores: Record<string, SectorMetric> = {
    gn: {
      id: 'gn',
      name: 'Whats GN',
      shortName: 'GN',
      finalizados: 106,
      chamados: 38,
      pendencias: 0,
      taxaChamados: (38 / 106) * 100,
      percentOfTotal: (106 / 108) * 100,
      accentColor: '#10b981',
      textColor: 'text-emerald-400',
    },
    gv: {
      id: 'gv',
      name: 'Whats GV',
      shortName: 'GV',
      finalizados: 2,
      chamados: 2,
      pendencias: 0,
      taxaChamados: (2 / 2) * 100,
      percentOfTotal: (2 / 108) * 100,
      accentColor: '#3b82f6',
      textColor: 'text-blue-400',
    },
    gv_antecipada: {
      id: 'gv_antecipada',
      name: 'Whats GV Antecipada',
      shortName: 'GV Antecipada',
      finalizados: 0,
      chamados: 0,
      pendencias: 0,
      taxaChamados: 0,
      percentOfTotal: 0,
      accentColor: '#8b5cf6',
      textColor: 'text-purple-400',
    },
    franquia: {
      id: 'franquia',
      name: 'Whats Franquia',
      shortName: 'Franquia',
      finalizados: 0,
      chamados: 0,
      pendencias: 0,
      taxaChamados: 0,
      percentOfTotal: 0,
      accentColor: '#f59e0b',
      textColor: 'text-amber-400',
    },
    cb_commerce: {
      id: 'cb_commerce',
      name: 'Whats CB Commerce',
      shortName: 'CB Commerce',
      finalizados: 0,
      chamados: 0,
      pendencias: 0,
      taxaChamados: 0,
      percentOfTotal: 0,
      accentColor: '#06b6d4',
      textColor: 'text-cyan-400',
    },
  };

  const demoPessoas = ['MARCIO MIRANDA', 'VANESSA DUARTE', 'RAFAELLA CRISTINY', 'WILLIANE BORGES'];
  const demoSetores = ['Whats GN', 'Whats GV', 'Whats GV Antecipada'];

  const gerarDemoProtocolos = (qtd: number, prefix: string) => {
    return Array.from({ length: qtd }, (_, i) => ({
      protocolo: `20261029${prefix}${String(i + 1).padStart(3, '0')}`,
      chamado: i % 2 === 0 ? `TKT-88${prefix}${i + 1}` : '',
      responsavel: demoPessoas[i % demoPessoas.length],
      setor: demoSetores[i % demoSetores.length],
      tempoOperacao: `${(i % 5) + 3}m ${(i * 7) % 60}s`,
    }));
  };

  const topAcionamentos: TopAcionamento[] = [
    {
      rank: 1,
      nome: 'ACESSO',
      quantidade: 52,
      percentual: (52 / 61) * 100,
      protocolos: gerarDemoProtocolos(52, '10'),
    },
    {
      rank: 2,
      nome: 'CAPTAÇÃO - PAG EMANA PAY',
      quantidade: 5,
      percentual: (5 / 61) * 100,
      protocolos: gerarDemoProtocolos(5, '20'),
    },
    {
      rank: 3,
      nome: 'PAINEL DE INDICADORES - SALDO DE CADASTRO',
      quantidade: 4,
      percentual: (4 / 61) * 100,
      protocolos: gerarDemoProtocolos(4, '30'),
    },
  ];

  return {
    filename: 'Exemplo_MKTZAP_Passagem_Turno.xlsx',
    uploadDate: new Date(),
    periodoTurno: getAutoShiftPeriod(),
    dataReferencia: formatCurrentDate(),
    totalFinalizados: 108,
    totalChamados: 40,
    totalPendencias: 0,
    taxaGeralChamados: (40 / 108) * 100,
    setores,
    topAcionamentos,
    demaisAcionamentosCount: 14,
    demaisAcionamentosCasos: 14,
    totalLinhasBrutas: 145,
    linhasNaoFinalizadas: 37,
  };
}
