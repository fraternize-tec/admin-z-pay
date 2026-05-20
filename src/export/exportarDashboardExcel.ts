import * as XLSX from "xlsx";

function downloadBlob(
  blob: Blob,
  fileName: string
) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportarDashboardExcel(
  data: any,
  nomeEvento: string
) {
  const wb = XLSX.utils.book_new();

  // Resumo
  if (
    data.financeiro &&
    Object.keys(data.financeiro).length > 0
  ) {
    const resumo = Object.entries(data.financeiro).map(
      ([indicador, valor]) => ({
        Indicador: indicador,
        Valor: valor,
      })
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(resumo),
      "Resumo"
    );
  }

  // Caixas
  if ((data.recargas_por_caixa ?? []).length > 0) {
    const caixas = data.recargas_por_caixa.flatMap(
      (cx: any) =>
        (cx.formas_pagamento ?? []).map((fp: any) => ({
          Caixa: cx.nome_caixa,
          Forma: fp.forma,
          Total: fp.total,
        }))
    );

    if (caixas.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(caixas),
        "Caixas"
      );
    }
  }

  // Operadores
  if ((data.recargas_por_operador ?? []).length > 0) {
    const operadores =
      data.recargas_por_operador.flatMap((op: any) =>
        (op.formas_pagamento ?? []).map((fp: any) => ({
          Operador: op.operador_nome,
          Forma: fp.forma,
          Total: fp.total,
        }))
      );

    if (operadores.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(operadores),
        "Operadores"
      );
    }
  }

  // PDVs
  if ((data.itens_por_pdv ?? []).length > 0) {
    const pdvs = data.itens_por_pdv.flatMap(
      (pdv: any) =>
        (pdv.itens ?? []).map((item: any) => ({
          PDV: pdv.nome_pdv,
          Item: item.item_nome,
          ValorUnitario: item.valor_unitario,
          Quantidade: item.quantidade,
          ValorTotal: item.valor_total,
        }))
    );

    if (pdvs.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(pdvs),
        "PDVs"
      );
    }
  }

  const arrayBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([arrayBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName =
    `relatorio-financeiro-${nomeEvento}.xlsx`
      .replace(/\s+/g, "-")
      .toLowerCase();

  downloadBlob(blob, fileName);
}