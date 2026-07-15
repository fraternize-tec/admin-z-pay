import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportarMovimentacoesExcel = async (
  movimentacoes: any[],
  nomeEvento: string
) => {

  const formatarData = (data: string) =>
    new Date(data).toLocaleString("pt-BR");

  const dados = movimentacoes.map((mov) => ({

    "Data/Hora": formatarData(mov.criado_em),

    "Tipo":
      String(mov.tipo ?? "")
        .charAt(0)
        .toUpperCase() +
      String(mov.tipo ?? "").slice(1),

    "Valor": Number(mov.valor ?? 0),

    "Código do Cartão":
      mov.codigo_cartao ?? "",

    "Tipo do Cartão":
      mov.tipo_cartao ?? "",

    "Forma de Pagamento":
      mov.forma_pagamento ?? "",

    "PDV":
      mov.pdv_nome ?? "",

    "Caixa":
      mov.caixa_nome ?? "",

    "Operador":
      mov.operador_nome ?? "",

  }));

  const worksheet =
    XLSX.utils.json_to_sheet(dados);

  // ============================
  // Formatação das colunas
  // ============================

  worksheet["!cols"] = [

    { wch: 22 }, // Data

    { wch: 15 }, // Tipo

    { wch: 15 }, // Valor

    { wch: 22 }, // Cartão

    { wch: 18 }, // Tipo Cartão

    { wch: 22 }, // Forma

    { wch: 28 }, // PDV

    { wch: 22 }, // Caixa

    { wch: 28 }, // Operador

  ];

  // ============================
  // Formata coluna Valor
  // ============================

  const range =
    XLSX.utils.decode_range(
      worksheet["!ref"]!
    );

  for (let row = 1; row <= range.e.r; row++) {

    const cell =
      XLSX.utils.encode_cell({
        r: row,
        c: 2,
      });

    if (worksheet[cell]) {
      worksheet[cell].t = "n";
      worksheet[cell].z =
        '"R$" #,##0.00';
    }

  }

  // ============================
  // Congela cabeçalho
  // ============================

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
  };

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Movimentações"
  );

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  const blob = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  saveAs(
    blob,
    `movimentacoes-${nomeEvento}.xlsx`
  );

};