import { Permissao } from "./types";

type Escopo =
  | { tipo: "global" }
  | { tipo: "evento"; id: string }
  | { tipo: "pdv"; id: string }
  | { tipo: "caixa"; id: string };

export const can = (
  permissions: Permissao[] | undefined,
  perm: string,
  escopo?: Escopo
): boolean => {
  if (!permissions) return false;

  return permissions.some((p) => {
    if (p.permissao !== perm) return false;

    // Se não foi informado escopo → qualquer escopo válido serve
    if (!escopo) return true;

    // Permissão global sempre autoriza
    if (p.escopo_tipo === "global") return true;

    // Escopo específico
    if (
      p.escopo_tipo === escopo.tipo &&
      p.escopo_id &&
      "id" in escopo &&
      p.escopo_id === escopo.id
    ) {
      return true;
    }

    return false;
  });
};