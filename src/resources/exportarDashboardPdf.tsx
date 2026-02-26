import { jsPDF } from "jspdf";
import { PoppinsBold } from "../fonts/Poppins-Bold";
import { InterRegular } from "../fonts/Inter-Regular";

export const exportarDashboardPdf = async (
  data: any,
  inicio: Date,
  fim: Date
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

  const ensurePage = (space = 15) => {
    if (y + space > 280) {
      doc.addPage();
      y = 20;
    }
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
  doc.setFontSize(10);
  doc.text(
    `${inicio.toLocaleString("pt-BR")} → ${fim.toLocaleString("pt-BR")}`,
    50,
    23
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
  // RESUMO
  // =============================
  section("Resumo Financeiro");

  line("Total Recargas", money(data.cards.total_recargas));
  line("Total Consumos", money(data.cards.total_consumos));
  line("Saldo", money(data.cards.saldo), true);

  y += 6;

  // =============================
  // CAIXAS
  // =============================
  section("Recargas por Caixa");

  data.recargas_por_caixa.forEach((cx: any) => {
    line(cx.nome_caixa, money(cx.total_recargas), true);

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
    line(
      `${op.operador_nome} (${op.qtd_recargas} recargas)`,
      money(op.total_recargas),
      true
    );

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