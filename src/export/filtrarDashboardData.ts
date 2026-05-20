// filtrarDashboardData.ts

import {
  ExportOptions,
  ExportSection,
} from "./ExportDialog";

export function filtrarDashboardData(
  data: any,
  options: ExportOptions
) {
  const clone = structuredClone(data);

  // ============================
  // 1. Aplicar filtros
  // ============================

  const { pdvs, caixas, operadores } =
    options.filters;

  // Filtrar PDVs
  if (pdvs.length > 0) {
    clone.itens_por_pdv =
      clone.itens_por_pdv.filter((p: any) =>
        pdvs.includes(p.nome_pdv)
      );
  }

  // Filtrar Caixas
  if (caixas.length > 0) {
    clone.recargas_por_caixa =
      clone.recargas_por_caixa.filter(
        (c: any) =>
          caixas.includes(c.nome_caixa)
      );
  }

  // Filtrar Operadores
  if (operadores.length > 0) {
    clone.recargas_por_operador =
      clone.recargas_por_operador.filter(
        (o: any) =>
          operadores.includes(
            o.operador_nome
          )
      );
  }

  // ============================
  // 2. Remover seções não selecionadas
  // ============================

  const selectedSections = new Set(
    options.sections
  );

  if (
    !selectedSections.has("financeiro")
  ) {
    clone.financeiro = {};
  }

  if (!selectedSections.has("cartoes")) {
    clone.cartoes = {};
  }

  if (!selectedSections.has("caixas")) {
    clone.recargas_por_caixa = [];
  }

  if (
    !selectedSections.has("operadores")
  ) {
    clone.recargas_por_operador = [];
  }

  if (!selectedSections.has("pdvs")) {
    clone.itens_por_pdv = [];
  }

  return clone;
}