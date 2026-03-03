export type Permissao = {
  usuario_id: string;
  permissao: string;
  escopo_tipo: "evento" | "global";
  escopo_id?: string;
};

export const eventosPermitidos = (
  permissions: Permissao[]
): string[] => {
  return permissions
    .filter(
      p =>
        p.permissao === "visualizar.relatorio" &&
        p.escopo_tipo === "evento"
    )
    .map(p => p.escopo_id!);
};

export const isAdminGlobal = (permissions: Permissao[]) =>
  permissions.some(
    p =>
      p.permissao === "visualizar.relatorio" &&
      p.escopo_tipo === "global"
  );