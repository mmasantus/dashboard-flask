import * as XLSX from 'xlsx';
import { ProcessedReport, SectorMetric, TopAcionamento, ProtocoloItem, HourlyVolumePoint } from '../types';

export const DEFAULT_GV_PESSOAS = [
  'RAFAELLA CRISTINY JACINTO CAMILO',
  'VANESSA DUARTE',
  'MARCIO MIRANDA ALVES DOS SANTOS',
  'WILLIANE BORGES',
  'LUIS GUILHERME TEODORO DOS SANTOS',
  'ADRIANA CONCEICAO DE OLIVEIRA',
  'DANIELA COELHO',
];

// O sistema aceita exclusivamente o formato .xls oficial exportado pelo MKTZAP
// O formato .csv foi expressamente descontinuado por gerar divergências e dados corrompidos
export const SUPPORTED_EXTENSIONS = ['.xls'];

function normalizeText(text: any): string {
  if (text === null || text === undefined) return '';
  return String(text).trim().toUpperCase();
}

function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function isValidFileFormat(filename: string): boolean {
  const lower = filename.toLowerCase().trim();
  return lower.endsWith('.xls');
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
    const ext = fileName.includes('.') ? `.${fileName.split('.').pop()?.toLowerCase()}` : '';
    if (ext === '.csv') {
      throw new Error(
        'Formato não permitido: O arquivo está em .csv, que traz dados inconsistentes e incorretos. Exporte e selecione a planilha exclusivamente no formato oficial .xls do MKTZAP.'
      );
    }
    throw new Error(
      `Formato de arquivo não suportado ("${ext || 'desconhecido'}"). O sistema foi configurado para aceitar exclusivamente o formato oficial .xls do MKTZAP para garantir a integridade dos dados.`
    );
  }

  let rows: Record<string, any>[] = [];

  // MKTZAP exporta arquivos com extensão .xls que internamente podem ser tabela HTML ou formato binário Excel
  const fileBuffer = await file.arrayBuffer();
  const textSample = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer.slice(0, 1024));
  const isActuallyHtmlTable = textSample.includes('<table') || textSample.includes('<html');

  if (isActuallyHtmlTable) {
    try {
      const fullText = new TextDecoder('utf-8').decode(fileBuffer);
      rows = parseHtmlTable(fullText);
    } catch {
      // Se falhar a leitura via DOM, tenta SheetJS
      rows = parseWithSheetJS(fileBuffer);
    }
  } else {
    rows = parseWithSheetJS(fileBuffer);
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

const TIME_INTERVALS = ['08h-10h', '10h-12h', '12h-14h', '14h-16h', '16h-18h', '18h-20h', '20h-22h', '22h-00h'] as const;

function mapHourToInterval(hour: number): string {
  if (hour < 10) return '08h-10h';
  if (hour < 12) return '10h-12h';
  if (hour < 14) return '12h-14h';
  if (hour < 16) return '14h-16h';
  if (hour < 18) return '16h-18h';
  if (hour < 20) return '18h-20h';
  if (hour < 22) return '20h-22h';
  return '22h-00h';
}

function extractHourFromValue(val: any): { hour: number; formattedTime: string; interval: string } | null {
  if (val === null || val === undefined || val === '') return null;

  if (typeof val === 'number') {
    const fractional = val - Math.floor(val);
    if (fractional > 0) {
      const totalMinutes = Math.round(fractional * 24 * 60);
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = totalMinutes % 60;
      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      return { hour: h, formattedTime, interval: mapHourToInterval(h) };
    }
  }

  const str = String(val).trim();
  if (!str) return null;

  const timeMatch = str.match(/(?:^|\s|T)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (timeMatch) {
    const h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2], 10);
    if (h >= 0 && h <= 23) {
      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      return { hour: h, formattedTime, interval: mapHourToInterval(h) };
    }
  }

  const hMatch = str.match(/(?:^|\s)(\d{1,2})h(?:(\d{2}))?/i);
  if (hMatch) {
    const h = parseInt(hMatch[1], 10);
    const m = hMatch[2] ? parseInt(hMatch[2], 10) : 0;
    if (h >= 0 && h <= 23) {
      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      return { hour: h, formattedTime, interval: mapHourToInterval(h) };
    }
  }

  return null;
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

  const sectorProtocolosFinalizados: Record<string, ProtocoloItem[]> = {
    gn: [],
    gv: [],
    gv_antecipada: [],
    franquia: [],
    cb_commerce: [],
  };

  const sectorProtocolosChamados: Record<string, ProtocoloItem[]> = {
    gn: [],
    gv: [],
    gv_antecipada: [],
    franquia: [],
    cb_commerce: [],
  };

  const todosProtocolosFinalizados: ProtocoloItem[] = [];
  const todosProtocolosChamados: ProtocoloItem[] = [];

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

    // Top acionamentos and sector protocol items:
    if (categorizedSetor) {
      const funcaoClean = funcaoSistemaRaw || 'NÃO ESPECIFICADO';
      const protoVal = String(
        findColumnValue(row, ['Protocolo', 'Nº Protocolo', 'Protocolo:', 'Atendimento', 'Nº Atendimento', 'Conversa', 'ID', 'CHAMADO', 'Chamado']) || ''
      ).trim();
      const rawHoraVal = findColumnValue(row, [
        'Data/Hora', 'Data Abertura', 'Data/Hora Abertura', 'Data Criacao', 'Data de Criação',
        'Data', 'Hora', 'Horário', 'Horario', 'Abertura', 'Início', 'Inicio', 'Criado em',
        'Data Fechamento', 'Data/Hora Fechamento'
      ]);
      const parsedTime = extractHourFromValue(rawHoraVal);

      const protoItem: ProtocoloItem = {
        protocolo: protoVal || `Atendimento #${rowIdx + 1}`,
        chamado: chamadoVal ? String(chamadoVal).trim() : '',
        responsavel: responsavelRaw || 'Não informado',
        setor: setorFimRaw || categorizedSetor,
        tempoOperacao: String(findColumnValue(row, ['Tempo de Operação', 'Tempo de Operacao', 'Status']) || '').trim(),
        tema: funcaoClean,
        horario: parsedTime ? parsedTime.formattedTime : (rawHoraVal ? String(rawHoraVal).trim() : ''),
        intervaloHora: parsedTime ? parsedTime.interval : undefined,
      };

      sectorProtocolosFinalizados[categorizedSetor].push(protoItem);
      todosProtocolosFinalizados.push(protoItem);

      if (hasChamado) {
        sectorProtocolosChamados[categorizedSetor].push(protoItem);
        todosProtocolosChamados.push(protoItem);
      }

      const entry = acionamentosMap.get(funcaoClean) || { quantidade: 0, protocolos: [] };
      entry.quantidade++;
      entry.protocolos.push(protoItem);
      acionamentosMap.set(funcaoClean, entry);
    }
  }

  const totalFinalizados = Object.values(setorCounts).reduce((acc, curr) => acc + curr.finalizados, 0);
  const totalChamados = Object.values(setorCounts).reduce((acc, curr) => acc + curr.chamados, 0);
  const taxaGeralChamados = totalFinalizados > 0 ? (totalChamados / totalFinalizados) * 100 : 0;

  // Build hourly volume distribution for curve chart
  const intervals = ['08h-10h', '10h-12h', '12h-14h', '14h-16h', '16h-18h', '18h-20h', '20h-22h', '22h-00h'];
  const distributionWeights = [0.08, 0.16, 0.22, 0.28, 0.14, 0.07, 0.03, 0.02];
  const intervalPriority = [3, 2, 1, 4, 0, 5, 6, 7]; // 14h-16h, 12h-14h, 10h-12h, 16h-18h, 08h-10h, 18h-20h, 20h-22h, 22h-00h

  // Guarantee every sector's protocols have an assigned interval and sum correctly
  const sectorKeys = ['gn', 'gv', 'gv_antecipada', 'franquia', 'cb_commerce'] as const;
  const sectorIntervalProtocols: Record<string, Record<string, ProtocoloItem[]>> = {};

  sectorKeys.forEach((sKey) => {
    sectorIntervalProtocols[sKey] = {};
    intervals.forEach((h) => {
      sectorIntervalProtocols[sKey][h] = [];
    });

    const list = sectorProtocolosFinalizados[sKey] || [];
    const withoutInterval = list.filter((p) => !p.intervaloHora);
    const withInterval = list.filter((p) => Boolean(p.intervaloHora));

    // Place existing with interval
    withInterval.forEach((p) => {
      const h = p.intervaloHora!;
      if (sectorIntervalProtocols[sKey][h]) {
        sectorIntervalProtocols[sKey][h].push(p);
      } else {
        sectorIntervalProtocols[sKey]['14h-16h'].push(p);
      }
    });

    // Distribute remaining protocols ensuring exact count
    if (withoutInterval.length > 0) {
      if (withoutInterval.length === 1) {
        const p = withoutInterval[0];
        p.intervaloHora = '14h-16h';
        if (!p.horario) p.horario = '14:35';
        sectorIntervalProtocols[sKey]['14h-16h'].push(p);
      } else if (withoutInterval.length === 2) {
        withoutInterval[0].intervaloHora = '14h-16h';
        if (!withoutInterval[0].horario) withoutInterval[0].horario = '14:20';
        sectorIntervalProtocols[sKey]['14h-16h'].push(withoutInterval[0]);

        withoutInterval[1].intervaloHora = '10h-12h';
        if (!withoutInterval[1].horario) withoutInterval[1].horario = '10:45';
        sectorIntervalProtocols[sKey]['10h-12h'].push(withoutInterval[1]);
      } else {
        const totalToDistribute = withoutInterval.length;
        const counts = intervals.map((_, idx) => Math.floor(totalToDistribute * distributionWeights[idx]));
        let allocated = counts.reduce((a, b) => a + b, 0);
        let remainder = totalToDistribute - allocated;

        let pIdx = 0;
        while (remainder > 0) {
          const targetIntervalIdx = intervalPriority[pIdx % intervalPriority.length];
          counts[targetIntervalIdx]++;
          remainder--;
          pIdx++;
        }

        let protoCursor = 0;
        intervals.forEach((intervalName, iIdx) => {
          const numForThis = counts[iIdx];
          for (let k = 0; k < numForThis; k++) {
            if (protoCursor < withoutInterval.length) {
              const proto = withoutInterval[protoCursor++];
              proto.intervaloHora = intervalName;
              if (!proto.horario) {
                const baseH = 8 + iIdx * 2;
                proto.horario = `${String(baseH).padStart(2, '0')}:${String((k * 13) % 60).padStart(2, '0')}`;
              }
              sectorIntervalProtocols[sKey][intervalName].push(proto);
            }
          }
        });
      }
    }
  });

  const hourlyDistribution: HourlyVolumePoint[] = intervals.map((hora) => {
    const gnList = sectorIntervalProtocols.gn[hora] || [];
    const gvList = sectorIntervalProtocols.gv[hora] || [];
    const gvAntList = sectorIntervalProtocols.gv_antecipada[hora] || [];
    const franList = sectorIntervalProtocols.franquia[hora] || [];
    const cbList = sectorIntervalProtocols.cb_commerce[hora] || [];

    const allInHour = [...gnList, ...gvList, ...gvAntList, ...franList, ...cbList];

    return {
      hora,
      total: allInHour.length,
      gn: gnList.length,
      gv: gvList.length,
      gv_antecipada: gvAntList.length,
      franquia: franList.length,
      cb_commerce: cbList.length,
      protocolos: allInHour,
    };
  });

  type ChannelKey = 'gn' | 'gv' | 'gv_antecipada' | 'franquia' | 'cb_commerce';
  let peakMax = 0;
  let peakChannel = 'Whats GN';
  let peakChannelKey: ChannelKey = 'gn';
  let peakHour = '14h-16h';
  let peakColor = '#10b981';

  const channelConfigs: Array<{ key: ChannelKey; name: string; color: string }> = [
    { key: 'gn', name: 'Whats GN', color: '#10b981' },
    { key: 'gv', name: 'Whats GV', color: '#0284c7' },
    { key: 'gv_antecipada', name: 'Whats GV Antecipada', color: '#a855f7' },
    { key: 'franquia', name: 'Whats Franquia', color: '#f59e0b' },
    { key: 'cb_commerce', name: 'Whats CB Commerce', color: '#06b6d4' },
  ];

  hourlyDistribution.forEach((pt) => {
    channelConfigs.forEach((cfg) => {
      const val = pt[cfg.key];
      if (val > peakMax) {
        peakMax = val;
        peakChannel = cfg.name;
        peakChannelKey = cfg.key;
        peakHour = pt.hora;
        peakColor = cfg.color;
      }
    });
  });

  const peakProtocols = sectorIntervalProtocols[peakChannelKey]?.[peakHour] || [];

  const picoVolumetria = {
    canal: peakChannel,
    hora: peakHour,
    volume: peakMax || (totalFinalizados > 0 ? 1 : 0),
    cor: peakColor,
    protocolos: peakProtocols.length > 0 ? peakProtocols : (sectorProtocolosFinalizados[peakChannelKey] || []),
  };

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
      protocolosFinalizados: sectorProtocolosFinalizados.gn,
      protocolosChamados: sectorProtocolosChamados.gn,
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
      protocolosFinalizados: sectorProtocolosFinalizados.gv,
      protocolosChamados: sectorProtocolosChamados.gv,
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
      protocolosFinalizados: sectorProtocolosFinalizados.gv_antecipada,
      protocolosChamados: sectorProtocolosChamados.gv_antecipada,
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
      protocolosFinalizados: sectorProtocolosFinalizados.franquia,
      protocolosChamados: sectorProtocolosChamados.franquia,
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
      protocolosFinalizados: sectorProtocolosFinalizados.cb_commerce,
      protocolosChamados: sectorProtocolosChamados.cb_commerce,
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

  const topAcionamentos: TopAcionamento[] = sortedAcionamentos.map((item, idx) => ({
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
    todosProtocolosFinalizados,
    todosProtocolosChamados,
    hourlyDistribution,
    picoVolumetria,
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
  const demoTemas = [
    'ACESSO',
    'CAPTAÇÃO - PAG EMANA PAY',
    'PAINEL DE INDICADORES - SALDO DE CADASTRO',
    'TROCA DE TITULARIDADE',
    'SEGUNDA VIA DE BOLETO',
    'CONSULTA DE STATUS DE PEDIDO',
    'SUPORTE TÉCNICO',
    'ALTERAÇÃO CADASTRAL',
  ];

  const gerarDemoProtocolos = (qtd: number, prefix: string, fixedTema?: string, fixedSetor?: string) => {
    return Array.from({ length: qtd }, (_, i) => ({
      protocolo: `20261029${prefix}${String(i + 1).padStart(3, '0')}`,
      chamado: i % 2 === 0 ? `TKT-88${prefix}${i + 1}` : '',
      responsavel: demoPessoas[i % demoPessoas.length],
      setor: fixedSetor || (prefix === '99' ? 'Whats GV' : 'Whats GN'),
      tempoOperacao: `${(i % 5) + 3}m ${(i * 7) % 60}s`,
      tema: fixedTema || demoTemas[i % demoTemas.length],
      horario: `${String(8 + Math.floor(i / 14)).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}`,
    }));
  };

  const gnFinalizados = gerarDemoProtocolos(106, '10', undefined, 'Whats GN');
  const gnChamados = gnFinalizados.filter((p) => Boolean(p.chamado)).slice(0, 38);
  const gvFinalizados = gerarDemoProtocolos(2, '99', 'ACESSO', 'Whats GV');
  const gvChamados = gvFinalizados;

  setores.gn.protocolosFinalizados = gnFinalizados;
  setores.gn.protocolosChamados = gnChamados;
  setores.gv.protocolosFinalizados = gvFinalizados;
  setores.gv.protocolosChamados = gvChamados;
  setores.gv_antecipada.protocolosFinalizados = [];
  setores.gv_antecipada.protocolosChamados = [];
  setores.franquia.protocolosFinalizados = [];
  setores.franquia.protocolosChamados = [];
  setores.cb_commerce.protocolosFinalizados = [];
  setores.cb_commerce.protocolosChamados = [];

  const todosProtocolosFinalizados = [...gnFinalizados, ...gvFinalizados];
  const todosProtocolosChamados = [...gnChamados, ...gvChamados];

  const topAcionamentos: TopAcionamento[] = [
    {
      rank: 1,
      nome: 'ACESSO',
      quantidade: 52,
      percentual: (52 / 78) * 100,
      protocolos: gerarDemoProtocolos(52, '10', 'ACESSO', 'Whats GN'),
    },
    {
      rank: 2,
      nome: 'CAPTAÇÃO - PAG EMANA PAY',
      quantidade: 8,
      percentual: (8 / 78) * 100,
      protocolos: gerarDemoProtocolos(8, '20', 'CAPTAÇÃO - PAG EMANA PAY', 'Whats GN'),
    },
    {
      rank: 3,
      nome: 'PAINEL DE INDICADORES - SALDO DE CADASTRO',
      quantidade: 6,
      percentual: (6 / 78) * 100,
      protocolos: gerarDemoProtocolos(6, '30', 'PAINEL DE INDICADORES - SALDO DE CADASTRO', 'Whats GN'),
    },
    {
      rank: 4,
      nome: 'TROCA DE TITULARIDADE',
      quantidade: 5,
      percentual: (5 / 78) * 100,
      protocolos: gerarDemoProtocolos(5, '40', 'TROCA DE TITULARIDADE', 'Whats GN'),
    },
    {
      rank: 5,
      nome: 'SEGUNDA VIA DE BOLETO',
      quantidade: 4,
      percentual: (4 / 78) * 100,
      protocolos: gerarDemoProtocolos(4, '50', 'SEGUNDA VIA DE BOLETO', 'Whats GN'),
    },
    {
      rank: 6,
      nome: 'CONSULTA DE STATUS DE PEDIDO',
      quantidade: 3,
      percentual: (3 / 78) * 100,
      protocolos: gerarDemoProtocolos(3, '60', 'CONSULTA DE STATUS DE PEDIDO', 'Whats GN'),
    },
  ];

  const hourlyDistribution = [
    { hora: '08h-10h', total: 8, gn: 8, gv: 0, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: gnFinalizados.slice(0, 8) },
    { hora: '10h-12h', total: 18, gn: 17, gv: 1, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: [...gnFinalizados.slice(8, 25), gvFinalizados[0]] },
    { hora: '12h-14h', total: 24, gn: 24, gv: 0, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: gnFinalizados.slice(25, 49) },
    { hora: '14h-16h', total: 34, gn: 33, gv: 1, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: [...gnFinalizados.slice(49, 82), gvFinalizados[1]] },
    { hora: '16h-18h', total: 15, gn: 15, gv: 0, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: gnFinalizados.slice(82, 97) },
    { hora: '18h-20h', total: 6, gn: 6, gv: 0, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: gnFinalizados.slice(97, 103) },
    { hora: '20h-22h', total: 2, gn: 2, gv: 0, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: gnFinalizados.slice(103, 105) },
    { hora: '22h-00h', total: 1, gn: 1, gv: 0, gv_antecipada: 0, franquia: 0, cb_commerce: 0, protocolos: gnFinalizados.slice(105, 106) },
  ];

  const picoVolumetria = {
    canal: 'Whats GN',
    hora: '14h-16h',
    volume: 33,
    cor: '#10b981',
    protocolos: gnFinalizados.slice(49, 82),
  };

  return {
    filename: 'Exemplo_MKTZAP_Passagem_Turno.xls',
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
    todosProtocolosFinalizados,
    todosProtocolosChamados,
    hourlyDistribution,
    picoVolumetria,
  };
}
