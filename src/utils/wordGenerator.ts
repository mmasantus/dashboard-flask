import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { ProcessedReport } from '../types';

function formatNumber(num: number): string {
  if (num < 10 && num >= 0) {
    return `0${num}`;
  }
  return String(num);
}

export function formatReportAsText(report: ProcessedReport): string {
  const gn = report.setores.gn || { finalizados: 0, chamados: 0, pendencias: 0 };
  const gv = report.setores.gv || { finalizados: 0, chamados: 0, pendencias: 0 };
  const gvAntecipada = report.setores.gv_antecipada || { finalizados: 0, chamados: 0, pendencias: 0 };
  const franquia = report.setores.franquia || { finalizados: 0, chamados: 0, pendencias: 0 };
  const cbCommerce = report.setores.cb_commerce || { finalizados: 0, chamados: 0, pendencias: 0 };

  const top1 = report.topAcionamentos[0] ? `1º ${report.topAcionamentos[0].nome}: ${report.topAcionamentos[0].quantidade}` : '1º -: 00';
  const top2 = report.topAcionamentos[1] ? `2º ${report.topAcionamentos[1].nome}: ${report.topAcionamentos[1].quantidade}` : '2º -: 00';
  const top3 = report.topAcionamentos[2] ? `3º ${report.topAcionamentos[2].nome}: ${report.topAcionamentos[2].quantidade}` : '3º -: 00';

  return `📋 Passagem de Turno MKTZAP
🕗 ${report.periodoTurno} | 📅${report.dataReferencia}

━━━━━━━━━━━━━━
📲 Whats GN
✅ Finalizados: ${formatNumber(gn.finalizados)}
⚙️ Chamados: ${formatNumber(gn.chamados)}
⚠️ Pendências: ${formatNumber(gn.pendencias)}


📲 Whats GV
✅ Finalizados: ${formatNumber(gv.finalizados)}
⚙️ Chamados: ${formatNumber(gv.chamados)}
⚠️ Pendências: ${formatNumber(gv.pendencias)}


📲 Whats GV Antecipada
✅ Finalizados: ${formatNumber(gvAntecipada.finalizados)}
⚙️ Chamados: ${formatNumber(gvAntecipada.chamados)}
⚠️ Pendências: ${formatNumber(gvAntecipada.pendencias)}


📲 Whats Franquia
✅ Finalizados: ${formatNumber(franquia.finalizados)}
⚙️ Chamados: ${formatNumber(franquia.chamados)}
⚠️ Pendências: ${formatNumber(franquia.pendencias)}

📲 Whats CB Commerce
✅ Finalizados: ${formatNumber(cbCommerce.finalizados)}
⚙️ Chamados: ${formatNumber(cbCommerce.chamados)}
⚠️ Pendências: ${formatNumber(cbCommerce.pendencias)}

🏆 Top Acionamentos


${top1}
${top2}
${top3}`;
}

export async function downloadWordDocument(report: ProcessedReport): Promise<void> {
  const gn = report.setores.gn || { finalizados: 0, chamados: 0, pendencias: 0 };
  const gv = report.setores.gv || { finalizados: 0, chamados: 0, pendencias: 0 };
  const gvAntecipada = report.setores.gv_antecipada || { finalizados: 0, chamados: 0, pendencias: 0 };
  const franquia = report.setores.franquia || { finalizados: 0, chamados: 0, pendencias: 0 };
  const cbCommerce = report.setores.cb_commerce || { finalizados: 0, chamados: 0, pendencias: 0 };

  const top1 = report.topAcionamentos[0] ? `1º ${report.topAcionamentos[0].nome}: ${report.topAcionamentos[0].quantidade}` : '1º -: 00';
  const top2 = report.topAcionamentos[1] ? `2º ${report.topAcionamentos[1].nome}: ${report.topAcionamentos[1].quantidade}` : '2º -: 00';
  const top3 = report.topAcionamentos[2] ? `3º ${report.topAcionamentos[2].nome}: ${report.topAcionamentos[2].quantidade}` : '3º -: 00';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header title
          new Paragraph({
            text: '📋 Passagem de Turno MKTZAP',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
          }),
          // Shift & Date
          new Paragraph({
            children: [
              new TextRun({
                text: `🕗 ${report.periodoTurno} | 📅${report.dataReferencia}`,
                bold: true,
                size: 24, // 12pt
                color: '333333',
              }),
            ],
            spacing: { after: 200 },
          }),
          // Divider
          new Paragraph({
            text: '━━━━━━━━━━━━━━',
            spacing: { after: 240 },
          }),

          // Sector 1: Whats GN
          new Paragraph({
            children: [
              new TextRun({
                text: '📲 Whats GN',
                bold: true,
                size: 26,
                color: '0D5C3A',
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `✅ Finalizados: ${formatNumber(gn.finalizados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚙️ Chamados: ${formatNumber(gn.chamados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚠️ Pendências: ${formatNumber(gn.pendencias)}`, size: 22 })],
            spacing: { after: 240 },
          }),

          // Sector 2: Whats GV
          new Paragraph({
            children: [
              new TextRun({
                text: '📲 Whats GV',
                bold: true,
                size: 26,
                color: '1E40AF',
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `✅ Finalizados: ${formatNumber(gv.finalizados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚙️ Chamados: ${formatNumber(gv.chamados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚠️ Pendências: ${formatNumber(gv.pendencias)}`, size: 22 })],
            spacing: { after: 240 },
          }),

          // Sector 3: Whats GV Antecipada
          new Paragraph({
            children: [
              new TextRun({
                text: '📲 Whats GV Antecipada',
                bold: true,
                size: 26,
                color: '6D28D9',
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `✅ Finalizados: ${formatNumber(gvAntecipada.finalizados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚙️ Chamados: ${formatNumber(gvAntecipada.chamados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚠️ Pendências: ${formatNumber(gvAntecipada.pendencias)}`, size: 22 })],
            spacing: { after: 240 },
          }),

          // Sector 4: Whats Franquia
          new Paragraph({
            children: [
              new TextRun({
                text: '📲 Whats Franquia',
                bold: true,
                size: 26,
                color: 'B45309',
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `✅ Finalizados: ${formatNumber(franquia.finalizados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚙️ Chamados: ${formatNumber(franquia.chamados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚠️ Pendências: ${formatNumber(franquia.pendencias)}`, size: 22 })],
            spacing: { after: 240 },
          }),

          // Sector 5: Whats CB Commerce
          new Paragraph({
            children: [
              new TextRun({
                text: '📲 Whats CB Commerce',
                bold: true,
                size: 26,
                color: '0E7490',
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `✅ Finalizados: ${formatNumber(cbCommerce.finalizados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚙️ Chamados: ${formatNumber(cbCommerce.chamados)}`, size: 22 })],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `⚠️ Pendências: ${formatNumber(cbCommerce.pendencias)}`, size: 22 })],
            spacing: { after: 300 },
          }),

          // Top Acionamentos section
          new Paragraph({
            children: [
              new TextRun({
                text: '🏆 Top Acionamentos',
                bold: true,
                size: 28,
                color: '111827',
              }),
            ],
            spacing: { after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: top1,
                size: 22,
                bold: true,
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: top2,
                size: 22,
                bold: true,
              }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: top3,
                size: 22,
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanDate = report.dataReferencia.replace(/\//g, '-');
  saveAs(blob, `Passagem_de_Turno_MKTZAP_${cleanDate}.docx`);
}
