import { jsPDF } from "jspdf";
import { PoppinsBold } from "../fonts/Poppins-Bold";
import { InterRegular } from "../fonts/Inter-Regular";

export const exportarDashboardPdf = async (
  data: any,
  inicio: Date,
  fim: Date,
  nomeEvento: string
) => {

  const doc = new jsPDF();

  // ✅ REGISTRA FONTES (IGUAL AO CARTÃO)
  doc.addFileToVFS("Poppins-Bold.ttf", PoppinsBold);
  doc.addFont("Poppins-Bold.ttf", "Poppins", "bold");

  doc.addFileToVFS("Inter-Regular.ttf", InterRegular);
  doc.addFont("Inter-Regular.ttf", "Inter", "normal");

  // =============================
  // CARREGA LOGO DA PUBLIC
  // =============================
  const logo = await urlToBase64("/logo.png");

  const COLORS = {
    petrolBlue: [0, 43, 54] as const,
    petrolBlueDark: [0, 31, 39] as const,
    petrolBlueSoft: [0, 56, 69] as const,
    orange: [204, 85, 0] as const,
    lightBackground: [247, 245, 242] as const,
  };

  let y = 20;

  const money = (v: number) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const number = (v: number) =>
    v.toLocaleString("pt-BR");

  const ensurePage = (space = 15) => {
    if (y + space > 280) {
      doc.addPage();
      y = 20;
    }
  };

  const flowLine = (
    label: string,
    value: number,
    type: "plus" | "minus" | "result" = "plus"
  ) => {
    const prefix =
      type === "minus" ? "(-) " :
        type === "plus" ? "(+) " :
          "";

    line(prefix + label, money(value), type === "result");
  };

  // =============================
  // HEADER
  // =============================
  doc.setFillColor(...COLORS.petrolBlue);
  doc.rect(0, 0, 210, 32, "F");

  doc.addImage(logo, "PNG", 14, 8, 20, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFont("Poppins", "bold");
  doc.setFontSize(18);
  doc.text("Relatório Financeiro", 50, 16);

  doc.setFont("Inter", "normal");
  doc.setFontSize(11);
  doc.text(nomeEvento, 50, 22);

  doc.setFont("Inter", "normal");
  doc.setFontSize(10);
  doc.text(
    `${inicio.toLocaleString("pt-BR")} → ${fim.toLocaleString("pt-BR")}`,
    50,
    28
  );

  y = 42;
  doc.setTextColor(...COLORS.petrolBlueDark);

  // =============================
  // HELPERS
  // =============================
  const section = (title: string) => {
    ensurePage(20);

    doc.setFillColor(...COLORS.lightBackground);
    doc.rect(14, y - 6, 182, 10, "F");

    doc.setFont("Poppins", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.orange);
    doc.text(title, 16, y);

    y += 10;
    doc.setTextColor(...COLORS.petrolBlueDark);
  };

  const line = (label: string, value: string, bold = false) => {
    ensurePage();

    doc.setFont(bold ? "Poppins" : "Inter", bold ? "bold" : "normal");
    doc.setFontSize(10);

    doc.text(label, 16, y);
    doc.text(value, 194, y, { align: "right" });

    y += 6;
  };

  const subLine = (label: string, value: string) => {
    ensurePage();

    doc.setFont("Inter", "normal");
    doc.setFontSize(9);

    doc.text(`• ${label}`, 20, y);
    doc.text(value, 194, y, { align: "right" });

    y += 5;
  };

  // =============================
  // RESUMO FINANCEIRO (NOVO MODELO)
  // =============================
  section("Resumo Financeiro");

  const f = data.financeiro;

  const possuiTaxa = (f.taxas_arrecadadas ?? 0) > 0;
  const possuiCortesias = (f.cortesias ?? 0) > 0;

  // fluxo financeiro
  flowLine("Recebido Bruto", f.valor_bruto_recebido);
  if (possuiTaxa) {
    flowLine("Taxas do Evento", f.taxas_arrecadadas, "minus");
  }

  if (possuiCortesias) {
    flowLine("Cortesias", f.cortesias);
  }

  flowLine("Carregado em Cartões", f.valor_liquido_cartoes, "result");

  y += 2;

  flowLine("Consumido", f.total_consumido, "minus");

  if ((f.devolucoes ?? 0) > 0) {
    flowLine("Devoluções", f.devolucoes, "minus");
  }

  // destaque final
  doc.setFont("Poppins", "bold");
  doc.setFontSize(12);

  flowLine("Saldo em Circulação", f.saldo_evento, "result");

  y += 8;

  // =============================
  // INDICADORES OPERACIONAIS
  // =============================
  section("Indicadores Operacionais");

  line(
    "Cartões Utilizados",
    number(data.cartoes.total_cartoes_utilizados),
    true
  );

  line(
    "Cartões do Evento",
    number(data.cartoes.cartoes_evento)
  );

  line(
    "Cartões Emergenciais",
    number(data.cartoes.cartoes_emergenciais)
  );

  y += 6;

  // =============================
  // CAIXAS
  // =============================
  section("Recargas por Caixa");

  data.recargas_por_caixa.forEach((cx: any) => {
    line(cx.nome_caixa, money(cx.total_recargas), true);

    // métricas operacionais do caixa
    const infoCaixa = [];

    if (cx.cartoes_utilizados != null)
      infoCaixa.push(`${number(cx.cartoes_utilizados)} cartões`);

    if (infoCaixa.length) {
      doc.setFont("Inter", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.petrolBlueSoft);

      doc.text(infoCaixa.join(" • "), 18, y);
      y += 5;

      doc.setTextColor(...COLORS.petrolBlueDark);
    }

    cx.formas_pagamento.forEach((fp: any) => {
      subLine(fp.forma, money(fp.total));
    });

    doc.setDrawColor(220);
    doc.line(14, y - 2, 196, y - 2);
    y += 4;
  });

  // =============================
  // OPERADORES
  // =============================
  section("Recargas por Operador");

  data.recargas_por_operador.forEach((op: any) => {
    line(op.operador_nome, money(op.total_recargas), true);

    const infoOperador = [
      `${number(op.qtd_recargas)} recargas`,
    ];

    if (op.cartoes_utilizados != null)
      infoOperador.push(`${number(op.cartoes_utilizados)} cartões`);

    doc.setFont("Inter", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.petrolBlueSoft);

    doc.text(infoOperador.join(" • "), 18, y);
    y += 5;

    doc.setTextColor(...COLORS.petrolBlueDark);

    op.formas_pagamento.forEach((fp: any) => {
      subLine(fp.forma, money(fp.total));
    });

    doc.setDrawColor(220);
    doc.line(14, y - 2, 196, y - 2);
    y += 4;
  });

  // =============================
  // PDVS
  // =============================
  section("Vendas por PDV");

  data.itens_por_pdv.forEach((pdv: any) => {
    line(pdv.nome_pdv, money(pdv.total_vendas), true);

    pdv.itens.forEach((item: any) => {
      if (!item.quantidade) return;

      const label =
        item.valor_unitario != null
          ? `${item.item_nome} — ${money(item.valor_unitario)} (${item.quantidade})`
          : `${item.item_nome} (${item.quantidade})`;

      subLine(label, money(item.valor_total));
    });

    doc.setDrawColor(220);
    doc.line(14, y - 2, 196, y - 2);
    y += 4;
  });

  doc.save("relatorio-financeiro-evento.pdf");
};


// helper
const urlToBase64 = async (url: string): Promise<string> => {
  const blob = await fetch(url).then(r => r.blob());

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};