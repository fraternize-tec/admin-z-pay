import { saveAs } from "file-saver";

export const exportarMovimentacoesCsv = async (
  movimentacoes: any[],
  nomeEvento: string
) => {
  const formatarData = (data: string) =>
    new Date(data).toLocaleString("pt-BR");

  const linhas = [
    [
      "Data/Hora",
      "Tipo",
      "Valor",
      "Código do Cartão",
      "Tipo do Cartão",
      "Forma de Pagamento",
      "PDV",
      "Caixa",
      "Operador",
    ],
  ];

  movimentacoes.forEach((mov) => {
    linhas.push([
      formatarData(mov.criado_em),
      mov.tipo ?? "",
      Number(mov.valor ?? 0).toFixed(2).replace(".", ","),
      mov.codigo_cartao ?? "",
      mov.tipo_cartao ?? "",
      mov.forma_pagamento ?? "",
      mov.pdv_nome ?? "",
      mov.caixa_nome ?? "",
      mov.operador_nome ?? "",
    ]);
  });

  const csv = linhas
    .map((linha) =>
      linha
        .map((campo) => `"${String(campo).replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  saveAs(
    blob,
    `movimentacoes-${nomeEvento}.csv`
  );
};