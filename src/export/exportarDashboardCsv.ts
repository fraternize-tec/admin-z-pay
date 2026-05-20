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

function escapeCsv(value: any) {
  if (value == null) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export async function exportarDashboardCsv(
  data: any,
  nomeEvento: string
) {
  const linhas: string[] = [];

  // Resumo Financeiro
  if (
    data.financeiro &&
    Object.keys(data.financeiro).length > 0
  ) {
    linhas.push("Resumo Financeiro");
    linhas.push("Indicador,Valor");

    Object.entries(data.financeiro).forEach(([key, value]) => {
      linhas.push(
        `${escapeCsv(key)},${escapeCsv(value)}`
      );
    });

    linhas.push("");
  }

  // Caixas
  if ((data.recargas_por_caixa ?? []).length > 0) {
    linhas.push("Recargas por Caixa");
    linhas.push("Caixa,Forma de Pagamento,Total");

    data.recargas_por_caixa.forEach((cx: any) => {
      (cx.formas_pagamento ?? []).forEach((fp: any) => {
        linhas.push(
          [
            escapeCsv(cx.nome_caixa),
            escapeCsv(fp.forma),
            escapeCsv(fp.total),
          ].join(",")
        );
      });
    });

    linhas.push("");
  }

  // Operadores
  if ((data.recargas_por_operador ?? []).length > 0) {
    linhas.push("Recargas por Operador");
    linhas.push("Operador,Forma de Pagamento,Total");

    data.recargas_por_operador.forEach((op: any) => {
      (op.formas_pagamento ?? []).forEach((fp: any) => {
        linhas.push(
          [
            escapeCsv(op.operador_nome),
            escapeCsv(fp.forma),
            escapeCsv(fp.total),
          ].join(",")
        );
      });
    });

    linhas.push("");
  }

  // PDVs
  if ((data.itens_por_pdv ?? []).length > 0) {
    linhas.push("Vendas por PDV");
    linhas.push(
      "PDV,Item,Valor Unitário,Quantidade,Valor Total"
    );

    data.itens_por_pdv.forEach((pdv: any) => {
      (pdv.itens ?? []).forEach((item: any) => {
        linhas.push(
          [
            escapeCsv(pdv.nome_pdv),
            escapeCsv(item.item_nome),
            escapeCsv(item.valor_unitario),
            escapeCsv(item.quantidade),
            escapeCsv(item.valor_total),
          ].join(",")
        );
      });
    });

    linhas.push("");
  }

  const csv = "\uFEFF" + linhas.join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const fileName =
    `relatorio-financeiro-${nomeEvento}.csv`
      .replace(/\s+/g, "-")
      .toLowerCase();

  downloadBlob(blob, fileName);
}