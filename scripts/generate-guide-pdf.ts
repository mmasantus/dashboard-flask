import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function createGuidePdf() {
  const pdfDoc = await PDFDocument.create();

  // Load fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Colors
  const darkNavy = rgb(0.04, 0.06, 0.1);
  const emeraldGreen = rgb(0.06, 0.72, 0.51);
  const lightEmerald = rgb(0.9, 0.98, 0.95);
  const textDark = rgb(0.12, 0.16, 0.22);
  const textMuted = rgb(0.4, 0.46, 0.54);
  const textWhite = rgb(1, 1, 1);
  const bluePrimary = rgb(0.14, 0.42, 0.88);
  const amberAccent = rgb(0.95, 0.6, 0.07);
  const borderGrey = rgb(0.85, 0.88, 0.92);
  const bgCard = rgb(0.96, 0.97, 0.99);

  // Helper function to create page with header and footer
  const createPage = (pageNumber: number, totalPages: number) => {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Top decorative bar
    page.drawRectangle({
      x: 0,
      y: height - 8,
      width,
      height: 8,
      color: emeraldGreen,
    });

    // Running Header (except cover)
    if (pageNumber > 1) {
      page.drawText('PASSAGEM DE TURNO MKTZAP • GUIA DO USUÁRIO', {
        x: 40,
        y: height - 28,
        size: 8,
        font: fontBold,
        color: textMuted,
      });
      page.drawLine({
        start: { x: 40, y: height - 34 },
        end: { x: width - 40, y: height - 34 },
        thickness: 0.75,
        color: borderGrey,
      });
    }

    // Running Footer
    page.drawLine({
      start: { x: 40, y: 36 },
      end: { x: width - 40, y: 36 },
      thickness: 0.75,
      color: borderGrey,
    });
    page.drawText('Sistema Passagem de Turno MKTZAP • Administrador: Marcio Miranda Alves dos Santos', {
      x: 40,
      y: 22,
      size: 8,
      font: fontRegular,
      color: textMuted,
    });
    page.drawText(`Página ${pageNumber} de ${totalPages}`, {
      x: width - 100,
      y: 22,
      size: 8,
      font: fontBold,
      color: textMuted,
    });

    return page;
  };

  const TOTAL_PAGES = 3;

  // ==========================================
  // PÁGINA 1: CAPA, VISÃO GERAL & PASSOS 1 E 2
  // ==========================================
  const page1 = createPage(1, TOTAL_PAGES);
  const { width: p1W, height: p1H } = page1.getSize();

  // Header Box
  page1.drawRectangle({
    x: 40,
    y: p1H - 145,
    width: p1W - 80,
    height: 100,
    color: darkNavy,
  });

  page1.drawText('MANUAL OPERACIONAL & GUIA PASSO A PASSO', {
    x: 58,
    y: p1H - 72,
    size: 10,
    font: fontBold,
    color: emeraldGreen,
  });

  page1.drawText('Passagem de Turno MKTZAP', {
    x: 58,
    y: p1H - 100,
    size: 22,
    font: fontBold,
    color: textWhite,
  });

  page1.drawText('Consolidação de Canais, Ranking de Acionamentos, Relatórios Word & WhatsApp', {
    x: 58,
    y: p1H - 122,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.92),
  });

  // Admin Identification Box
  page1.drawRectangle({
    x: 40,
    y: p1H - 195,
    width: p1W - 80,
    height: 38,
    color: lightEmerald,
    borderColor: emeraldGreen,
    borderWidth: 1,
  });
  page1.drawText('ADMINISTRADOR DO SISTEMA: Marcio Miranda Alves dos Santos (eumarciomirandanovo@gmail.com)', {
    x: 52,
    y: p1H - 175,
    size: 9,
    font: fontBold,
    color: rgb(0.02, 0.38, 0.25),
  });
  page1.drawText('Controle restrito por senha ativo para gerenciamento da Equipe Experiência Brasil', {
    x: 52,
    y: p1H - 188,
    size: 8,
    font: fontRegular,
    color: rgb(0.1, 0.45, 0.3),
  });

  // Section 1: O que é o Sistema
  let currentY = p1H - 225;
  page1.drawText('1. O que é o Sistema de Passagem de Turno?', {
    x: 40,
    y: currentY,
    size: 13,
    font: fontBold,
    color: darkNavy,
  });

  currentY -= 16;
  const introText = [
    'O aplicativo Passagem de Turno MKTZAP é uma plataforma analítica desenvolvida para transformar',
    'relatórios brutos exportados do MKTZAP em uma síntese clara e padronizada para troca de turno operacional.',
    'O sistema consolida automaticamente 5 filas de atendimento, calcula métricas de volume e chamados,',
    'destaca os motivos mais frequentes (Top Acionamentos), permite copiar a ata pronta para o WhatsApp',
    'e faz o download oficial do documento em formato Word (.docx).'
  ];
  introText.forEach((line) => {
    page1.drawText(line, { x: 40, y: currentY, size: 9, font: fontRegular, color: textDark });
    currentY -= 13;
  });

  // Section 2: Passo 1 - Obter a Planilha
  currentY -= 10;
  page1.drawRectangle({
    x: 40,
    y: currentY - 75,
    width: p1W - 80,
    height: 85,
    color: bgCard,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page1.drawText('PASSO 1: Exportar o Relatório do MKTZAP', {
    x: 52,
    y: currentY - 14,
    size: 11,
    font: fontBold,
    color: bluePrimary,
  });
  const step1Lines = [
    '1. No painel do MKTZAP, acesse a área de Relatórios de Atendimentos do seu turno.',
    '2. Exporte a planilha. O sistema suporta nativamente os formatos: .html, .htm, .xlsx, .xls ou .csv.',
    '3. Dica: Arquivos exportados pelo MKTZAP em HTML ou XLS abrem diretamente sem necessidade de conversão.',
    '4. O sistema filtra automaticamente atendimentos finalizados e desconsidera cancelados e não finalizados.'
  ];
  let s1Y = currentY - 28;
  step1Lines.forEach((line) => {
    page1.drawText(line, { x: 52, y: s1Y, size: 8.5, font: fontRegular, color: textDark });
    s1Y -= 13;
  });

  // Section 3: Passo 2 - Como Carregar
  currentY -= 95;
  page1.drawRectangle({
    x: 40,
    y: currentY - 75,
    width: p1W - 80,
    height: 85,
    color: bgCard,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page1.drawText('PASSO 2: Carregar a Planilha na Plataforma', {
    x: 52,
    y: currentY - 14,
    size: 11,
    font: fontBold,
    color: emeraldGreen,
  });
  const step2Lines = [
    '1. Abra o site no navegador (computador, tablet ou celular).',
    '2. Arraste e solte o arquivo na área pontilhada central OU clique em "Escolher Arquivo".',
    '3. O processamento ocorre em menos de 1 segundo diretamente no navegador (100% privado e seguro).',
    '4. Você também pode clicar no botão "Carregar Exemplo" no cabeçalho para testar a interface.'
  ];
  let s2Y = currentY - 28;
  step2Lines.forEach((line) => {
    page1.drawText(line, { x: 52, y: s2Y, size: 8.5, font: fontRegular, color: textDark });
    s2Y -= 13;
  });

  // Section 4: Os 5 Canais Consolidados
  currentY -= 95;
  page1.drawText('2. Canais de Atendimento Monitorados', {
    x: 40,
    y: currentY,
    size: 13,
    font: fontBold,
    color: darkNavy,
  });
  currentY -= 16;
  const canais = [
    '- Whats GN: Atendimentos concluidos com destino ao setor Whats GN.',
    '- Whats GV: Atendimentos com destino ao setor Whats GV convencional.',
    '- Whats GV Antecipada (Experiencia Brasil): Atendimentos vinculados aos integrantes da equipe.',
    '- Whats Franquia: Atendimentos direcionados aos lojistas e franqueados.',
    '- Whats CB Commerce: Atendimentos direcionados ao suporte CB Commerce.'
  ];
  canais.forEach((line) => {
    page1.drawText(line, { x: 40, y: currentY, size: 8.5, font: fontRegular, color: textDark });
    currentY -= 13;
  });

  // ==========================================
  // PAGINA 2: SEGURANCA E ADMINISTRACAO (MARCIO MIRANDA)
  // ==========================================
  const page2 = createPage(2, TOTAL_PAGES);
  const { width: p2W, height: p2H } = page2.getSize();

  let p2Y = p2H - 55;
  page2.drawText('PASSO 3: Controle Restrito da Equipe Experiencia Brasil', {
    x: 40,
    y: p2Y,
    size: 14,
    font: fontBold,
    color: darkNavy,
  });
  p2Y -= 16;
  page2.drawText('Como funciona a seguranca, permissoes e o papel de Administrador de Marcio Miranda', {
    x: 40,
    y: p2Y,
    size: 9.5,
    font: fontRegular,
    color: textMuted,
  });

  p2Y -= 20;

  // Box: Papel do Administrador
  page2.drawRectangle({
    x: 40,
    y: p2Y - 110,
    width: p2W - 80,
    height: 120,
    color: rgb(0.98, 0.96, 0.9),
    borderColor: amberAccent,
    borderWidth: 1.2,
  });

  page2.drawText('CONTROLE DE ACESSO EXCLUSIVO DO ADMINISTRADOR', {
    x: 54,
    y: p2Y - 16,
    size: 10,
    font: fontBold,
    color: rgb(0.65, 0.4, 0.02),
  });

  const adminRules = [
    '- Administrador Titular: Marcio Miranda Alves dos Santos.',
    '- Acesso Restrito: Usuarios comuns podem visualizar a lista de atendentes, porem qualquer tentativa',
    '  de incluir, excluir ou alterar a equipe exige obrigatoriamente a senha master do administrador.',
    '- Senha Padrao Inicial: O sistema e inicializado com a senha "admin123".',
    '- Alteracao de Senha: Marcio Miranda pode alterar a senha para uma chave pessoal exclusiva a qualquer',
    '  momento dentro do modal, garantindo protecao total contra acessos indevidos.',
    '- Bloqueio Rapido: O administrador pode clicar no botao "Bloquear" para trancar o painel em modo leitura.'
  ];
  let rY = p2Y - 32;
  adminRules.forEach((rule) => {
    page2.drawText(rule, { x: 54, y: rY, size: 8.5, font: fontRegular, color: textDark });
    rY -= 12;
  });

  p2Y -= 135;

  // Fluxo de Alteração Passo a Passo
  page2.drawText('Fluxo Operacional de Alteracao da Equipe:', {
    x: 40,
    y: p2Y,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });
  p2Y -= 18;

  const stepsAdmin = [
    {
      num: '1',
      title: 'Abrir o Modal da Equipe',
      desc: 'Clique no botao azul "Equipe Experiencia Brasil" no cabecalho superior do site.'
    },
    {
      num: '2',
      title: 'Tentativa de Alteracao ou Desbloqueio',
      desc: 'Clique em "Entrar como Admin" ou tente digitar um novo nome e clicar em "Adicionar" / "Excluir".'
    },
    {
      num: '3',
      title: 'Autenticacao com Senha',
      desc: 'O modal de seguranca solicitara a senha. Digite a senha do administrador Marcio Miranda para liberar.'
    },
    {
      num: '4',
      title: 'Modificacao e Recalculo Instantaneo',
      desc: 'Com o Modo Administrador Ativo, faca as adicoes ou remocoes. O sistema recalcula os dados na hora!'
    },
    {
      num: '5',
      title: 'Bloqueio de Seguranca',
      desc: 'Apos concluir, clique em "Bloquear" para que ninguem mais faca alteracoes sem a sua senha.'
    }
  ];

  stepsAdmin.forEach((st) => {
    page2.drawRectangle({
      x: 40,
      y: p2Y - 32,
      width: 24,
      height: 24,
      color: emeraldGreen,
    });
    page2.drawText(st.num, {
      x: 48,
      y: p2Y - 24,
      size: 12,
      font: fontBold,
      color: textWhite,
    });

    page2.drawText(st.title, {
      x: 72,
      y: p2Y - 16,
      size: 10,
      font: fontBold,
      color: textDark,
    });
    page2.drawText(st.desc, {
      x: 72,
      y: p2Y - 28,
      size: 8.5,
      font: fontRegular,
      color: textMuted,
    });

    p2Y -= 42;
  });

  p2Y -= 10;
  // Box: Recálculo em tempo real
  page2.drawRectangle({
    x: 40,
    y: p2Y - 60,
    width: p2W - 80,
    height: 60,
    color: rgb(0.92, 0.96, 1),
    borderColor: bluePrimary,
    borderWidth: 1,
  });
  page2.drawText('[RECALCULO AUTOMATICO E INSTANTANEO]', {
    x: 54,
    y: p2Y - 16,
    size: 9.5,
    font: fontBold,
    color: bluePrimary,
  });
  page2.drawText('Se voce ja tiver aberto um arquivo de planilha e adicionar ou remover um atendente da equipe,', {
    x: 54,
    y: p2Y - 30,
    size: 8.5,
    font: fontRegular,
    color: textDark,
  });
  page2.drawText('o sistema recalcula imediatamente a fila Whats GV Antecipada, a taxa de chamados e a Ata Word.', {
    x: 54,
    y: p2Y - 43,
    size: 8.5,
    font: fontRegular,
    color: textDark,
  });

  // ==========================================
  // PAGINA 3: INTERPRETACAO, WHATSAPP E WORD
  // ==========================================
  const page3 = createPage(3, TOTAL_PAGES);
  const { width: p3W, height: p3H } = page3.getSize();

  let p3Y = p3H - 55;
  page3.drawText('PASSO 4: Leitura dos Resultados e Indicadores (KPIs)', {
    x: 40,
    y: p3Y,
    size: 14,
    font: fontBold,
    color: darkNavy,
  });
  p3Y -= 16;
  page3.drawText('Entenda cada um dos cartoes e tabelas apresentados apos o processamento', {
    x: 40,
    y: p3Y,
    size: 9.5,
    font: fontRegular,
    color: textMuted,
  });

  p3Y -= 20;

  // Grid de 4 KPIs
  const kpis = [
    { title: 'Total Finalizados', desc: 'Volume de atendimentos concluidos no turno.' },
    { title: 'Total Chamados', desc: 'Atendimentos com chamados abertos.' },
    { title: 'Taxa Chamados (%)', desc: 'Proporcao de chamados vs finalizados.' },
    { title: 'Canal Lider', desc: 'Fila com maior demanda registrada.' },
  ];

  let kpiX = 40;
  kpis.forEach((kpi) => {
    page3.drawRectangle({
      x: kpiX,
      y: p3Y - 55,
      width: 122,
      height: 55,
      color: bgCard,
      borderColor: borderGrey,
      borderWidth: 1,
    });
    page3.drawText(kpi.title, {
      x: kpiX + 8,
      y: p3Y - 18,
      size: 8.5,
      font: fontBold,
      color: darkNavy,
    });
    page3.drawText(kpi.desc, {
      x: kpiX + 8,
      y: p3Y - 32,
      size: 7.5,
      font: fontRegular,
      color: textMuted,
      lineHeight: 10,
    });
    kpiX += 131;
  });

  p3Y -= 75;

  // Top Acionamentos & Protocolos
  page3.drawText('PASSO 5: Top Acionamentos e Visualizador de Protocolos', {
    x: 40,
    y: p3Y,
    size: 12,
    font: fontBold,
    color: darkNavy,
  });
  p3Y -= 16;
  const topText = [
    '- O sistema elenca os 3 principais motivos demandados no sistema (1o, 2o e 3o colocados) com percentuais.',
    '- Interatividade: Ao clicar em um dos acionamentos, o sistema abre o Modal de Protocolos com a lista',
    '  completa de atendentes, horarios e numeros de protocolos vinculados aquele motivo especifico.'
  ];
  topText.forEach((t) => {
    page3.drawText(t, { x: 40, y: p3Y, size: 8.5, font: fontRegular, color: textDark });
    p3Y -= 12;
  });

  p3Y -= 14;

  // Exportação
  page3.drawText('PASSO 6: Envio da Passagem de Turno (WhatsApp e Word)', {
    x: 40,
    y: p3Y,
    size: 12,
    font: fontBold,
    color: darkNavy,
  });
  p3Y -= 16;

  // Box WhatsApp
  page3.drawRectangle({
    x: 40,
    y: p3Y - 80,
    width: p3W - 80,
    height: 80,
    color: bgCard,
    borderColor: emeraldGreen,
    borderWidth: 1,
  });
  page3.drawText('Ata Formatada para WhatsApp ("Copiar para WhatsApp")', {
    x: 54,
    y: p3Y - 18,
    size: 10,
    font: fontBold,
    color: rgb(0.04, 0.45, 0.3),
  });
  const waLines = [
    '- Copia com 1 clique o texto padrao oficial da passagem de turno devidamente formatado.',
    '- Contem todos os marcadores operacionais, horario do turno e data.',
    '- Basta colar diretamente no grupo de WhatsApp da equipe ou da gerencia operacional.'
  ];
  let waY = p3Y - 32;
  waLines.forEach((l) => {
    page3.drawText(l, { x: 54, y: waY, size: 8.5, font: fontRegular, color: textDark });
    waY -= 12;
  });

  p3Y -= 95;

  // Box Word
  page3.drawRectangle({
    x: 40,
    y: p3Y - 80,
    width: p3W - 80,
    height: 80,
    color: bgCard,
    borderColor: bluePrimary,
    borderWidth: 1,
  });
  page3.drawText('Documento Oficial Word ("Baixar Arquivo Word .docx")', {
    x: 54,
    y: p3Y - 18,
    size: 10,
    font: fontBold,
    color: bluePrimary,
  });
  const docLines = [
    '- Gera e faz o download imediato de um documento oficial (.docx) formatado para Microsoft Word.',
    '- Contem cabecalho formal, quebras de linha corretas, destaques em negrito e divisao por canais.',
    '- Arquivo pronto para anexar em e-mails de passagem de turno ou arquivar no SharePoint/Drive.'
  ];
  let docY = p3Y - 32;
  docLines.forEach((l) => {
    page3.drawText(l, { x: 54, y: docY, size: 8.5, font: fontRegular, color: textDark });
    docY -= 12;
  });

  p3Y -= 95;

  // Box Final: Dúvidas e Suporte
  page3.drawRectangle({
    x: 40,
    y: p3Y - 55,
    width: p3W - 80,
    height: 55,
    color: darkNavy,
  });
  page3.drawText('SUPORTE E CONTATO DO ADMINISTRADOR', {
    x: 54,
    y: p3Y - 18,
    size: 9.5,
    font: fontBold,
    color: emeraldGreen,
  });
  page3.drawText('Administrador Responsavel: Marcio Miranda Alves dos Santos', {
    x: 54,
    y: p3Y - 32,
    size: 8.5,
    font: fontRegular,
    color: textWhite,
  });
  page3.drawText('E-mail: eumarciomirandanovo@gmail.com - Sistema Passagem de Turno MKTZAP', {
    x: 54,
    y: p3Y - 44,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.7, 0.75, 0.85),
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve(process.cwd(), 'public/Guia_Passo_a_Passo_MKTZAP.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF successfully created at: ${outputPath}`);
}

createGuidePdf().catch((err) => {
  console.error('Error creating PDF:', err);
  process.exit(1);
});
