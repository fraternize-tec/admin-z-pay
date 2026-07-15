import { jsPDF } from "jspdf";
import { PoppinsBold } from "../fonts/Poppins-Bold";
import { InterRegular } from "../fonts/Inter-Regular";

export const exportarMovimentacoesPdf = async (
  movimentacoes: any[],
  inicio: Date,
  fim: Date,
  nomeEvento: string,
  filtros?: {
    tipo?: string;
    operador?: string;
    caixa?: string;
    pdv?: string;
    formaPagamento?: string;
  }
) => {

  const doc = new jsPDF();

  // =============================
  // FONTES
  // =============================
  doc.addFileToVFS("Poppins-Bold.ttf", PoppinsBold);
  doc.addFont("Poppins-Bold.ttf", "Poppins", "bold");

  doc.addFileToVFS("Inter-Regular.ttf", InterRegular);
  doc.addFont("Inter-Regular.ttf", "Inter", "normal");

  // =============================
  // LOGO
  // =============================
  const logo = await urlToBase64("/logo.png");

  const COLORS = {
    petrolBlue: [0, 43, 54] as const,
    petrolBlueDark: [0, 31, 39] as const,
    petrolBlueSoft: [0, 56, 69] as const,
    orange: [204, 85, 0] as const,
    green: [46, 125, 50] as const,
    red: [198, 40, 40] as const,
    lightBackground: [247, 245, 242] as const,
  };

  let y = 20;

  const money = (v?: number | null) =>
    Number(v ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleString("pt-BR");

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
  doc.text("Relatório de Movimentações", 50, 16);

  doc.setFont("Inter", "normal");
  doc.setFontSize(11);
  doc.text(nomeEvento, 50, 22);

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

  const line = (
    label: string,
    value: string,
    bold = false
  ) => {

    ensurePage();

    doc.setFont(
      bold ? "Poppins" : "Inter",
      bold ? "bold" : "normal"
    );

    doc.setFontSize(10);

    doc.text(label, 16, y);

    doc.text(value, 194, y, {
      align: "right",
    });

    y += 6;
  };

  const subLine = (
    label: string,
    value: string
  ) => {

    ensurePage();

    doc.setFont("Inter", "normal");
    doc.setFontSize(9);

    doc.text(`• ${label}`, 20, y);

    doc.text(value, 194, y, {
      align: "right",
    });

    y += 5;
  };

  // =============================
  // RESUMO
  // =============================

  const resumo = movimentacoes.reduce((acc, mov) => {

    acc.total++;

    switch (mov.tipo) {

      case "recarga":
        acc.recargas += mov.valor;
        break;

      case "consumo":
        acc.consumos += Math.abs(mov.valor);
        break;

      case "devolucao":
        acc.devolucoes += Math.abs(mov.valor);
        break;

      case "reset":
        acc.resets += Math.abs(mov.valor);
        break;

    }

    return acc;

  }, {
    total: 0,
    recargas: 0,
    consumos: 0,
    devolucoes: 0,
    resets: 0,
  });

  section("Resumo");

  line(
    "Total de movimentações",
    resumo.total.toLocaleString("pt-BR"),
    true
  );

  line(
    "Recargas",
    money(resumo.recargas)
  );

  line(
    "Consumos",
    money(resumo.consumos)
  );

  line(
    "Devoluções",
    money(resumo.devolucoes)
  );

  line(
    "Resets",
    money(resumo.resets)
  );

  y += 5;

  // =============================
  // FILTROS
  // =============================

  if (filtros) {

    section("Filtros Aplicados");

    if (filtros.tipo)
      subLine("Tipo", filtros.tipo);

    if (filtros.operador)
      subLine("Operador", filtros.operador);

    if (filtros.caixa)
      subLine("Caixa", filtros.caixa);

    if (filtros.pdv)
      subLine("PDV", filtros.pdv);

    if (filtros.formaPagamento)
      subLine(
        "Forma de pagamento",
        filtros.formaPagamento
      );

    y += 4;

  }

  // =============================
  // MOVIMENTAÇÕES
  // =============================

  section("Extrato de Movimentações");

    movimentacoes.forEach((mov) => {

    ensurePage(18);

    // =============================
    // Tipo
    // =============================
    let cor = COLORS.petrolBlueDark;

    switch (mov.tipo) {

      case "recarga":
        cor = COLORS.green;
        break;

      case "consumo":
      case "devolucao":
      case "reset":
        cor = COLORS.red;
        break;

    }

    doc.setDrawColor(225);
    doc.line(14, y - 2, 196, y - 2);

    doc.setTextColor(...cor);
    doc.setFont("Poppins", "bold");
    doc.setFontSize(10);

    doc.text(
      String(mov.tipo).toUpperCase(),
      16,
      y + 3
    );

    doc.setTextColor(...COLORS.petrolBlueDark);

    doc.setFont("Inter", "normal");
    doc.setFontSize(9);

    y += 8;

    line(
      "Data",
      formatDate(mov.criado_em)
    );

    line(
      "Cartão",
      mov.codigo_cartao ?? "-"
    );


    if (mov.operador_nome) {
      line(
        "Operador",
        mov.operador_nome
      );
    }

    if (mov.caixa_nome) {
      line(
        "Caixa",
        mov.caixa_nome
      );
    }

    if (mov.pdv_nome) {
      line(
        "PDV",
        mov.pdv_nome
      );
    }

    if (mov.forma_pagamento) {
      line(
        "Forma de pagamento",
        mov.forma_pagamento
      );
    }

    doc.setFont("Poppins", "bold");
    doc.setFontSize(11);

    doc.setTextColor(...cor);

    doc.text(
      "Valor",
      16,
      y
    );

    doc.text(
      money(mov.valor),
      194,
      y,
      {
        align: "right",
      }
    );

    doc.setTextColor(...COLORS.petrolBlueDark);

    y += 10;

  });

  // =============================
  // RODAPÉ
  // =============================

  const paginas = doc.getNumberOfPages();

  for (let i = 1; i <= paginas; i++) {

    doc.setPage(i);

    doc.setDrawColor(230);

    doc.line(
      14,
      286,
      196,
      286
    );

    doc.setFont(
      "Inter",
      "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(
      "Gerado por Z Pay",
      14,
      291
    );

    doc.text(
      `${i}/${paginas}`,
      196,
      291,
      {
        align: "right",
      }
    );

  }

  doc.save(
    "relatorio-movimentacoes.pdf"
  );

};

// =============================
// Helper
// =============================
const urlToBase64 = async (
  url: string
): Promise<string> => {

  const blob = await fetch(url)
    .then((r) => r.blob());

  return await new Promise(
    (resolve, reject) => {

      const reader = new FileReader();

      reader.onloadend = () =>
        resolve(
          reader.result as string
        );

      reader.onerror = reject;

      reader.readAsDataURL(blob);

    }
  );

};