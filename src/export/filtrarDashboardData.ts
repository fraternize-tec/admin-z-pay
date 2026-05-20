// filtrarDashboardData.ts

export type ExportScope = "all" | "pdv" | "caixa" | "operador";

export function filtrarDashboardData(
  data: any,
  scope: ExportScope,
  selected: string
) {
  // Relatório completo
  if (scope === "all" || !selected) {
    return structuredClone(data);
  }

  const clone = structuredClone(data);

  // Ao exportar um escopo específico, zeramos as demais seções
  clone.financeiro = {};
  clone.cartoes = {};
  clone.taxas = {};
  clone.ultimas_transacoes = [];
  clone.itens_por_pdv = [];
  clone.recargas_por_caixa = [];
  clone.recargas_por_operador = [];

  switch (scope) {
    case "pdv":
      clone.itens_por_pdv = data.itens_por_pdv.filter(
        (p: any) => p.nome_pdv === selected
      );
      break;

    case "caixa":
      clone.recargas_por_caixa = data.recargas_por_caixa.filter(
        (c: any) => c.nome_caixa === selected
      );
      break;

    case "operador":
      clone.recargas_por_operador = data.recargas_por_operador.filter(
        (o: any) => o.operador_nome === selected
      );
      break;
  }

  return clone;
}