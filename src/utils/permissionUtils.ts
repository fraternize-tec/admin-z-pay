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

export const getEscopos = (permissions: Permissao[], permissao: string, escopoTipo?: string) =>
  permissions
    ?.filter(p => 
      p.permissao === permissao &&
      (!escopoTipo || p.escopo_tipo === escopoTipo)
    )
    ?.map(p => p.escopo_id);

export const isGlobal = (permissions: Permissao[], permissao: string) =>
  permissions?.some(
    p => p.permissao === permissao && p.escopo_tipo === 'global'
  );