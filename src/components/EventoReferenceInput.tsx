import { useEffect } from "react";
import { usePermissions, useGetList, ReferenceInput, SelectInput } from "react-admin";
import { getEscopos, isGlobal } from "../utils/permissionUtils";
import { useFormContext } from "react-hook-form";

export const EventoReferenceInput = ({
  disabled = false,
  permissao = "listar.pdv",
  resource = "pontos_de_venda"
}: any) => {

  const { permissions, isLoading } = usePermissions();
  const { setValue, getValues } = useFormContext();

  const escoposPermitidos = getEscopos(
    permissions,
    permissao,
    permissao === "listar.caixa" ? "caixa" : "pdv"
  ) || [];

  const eventosPermitidos = getEscopos(
    permissions,
    permissao,
    "evento"
  ) || [];

  const { data: registros } = useGetList(
    resource,
    {
      filter: { id: escoposPermitidos },
      pagination: { page: 1, perPage: 100 }
    },
    {
      enabled: escoposPermitidos.length > 0
    }
  );

  const eventosFromEscopo =
    registros?.map(p => p.evento_id) ?? [];

  const eventosFinal = [
    ...new Set([
      ...eventosPermitidos,
      ...eventosFromEscopo
    ])
  ];

  const global = isGlobal(permissions, permissao);

  useEffect(() => {
    if (!global && eventosFinal.length === 1) {
      const current = getValues("evento_id");

      if (!current) {
        setValue("evento_id", eventosFinal[0], {
          shouldDirty: true
        });
      }
    }
  }, [eventosFinal, global]);

  if (isLoading) return null;

  return (
    <ReferenceInput
      source="evento_id"
      reference="eventos"
      filter={!global ? { id: eventosFinal } : undefined}
    >
      <SelectInput
        optionText="nome"
        label="Evento"
        disabled={disabled}
        sx={
          !global && eventosFinal.length === 1
            ? {
                pointerEvents: "none",
                opacity: 0.8
              }
            : undefined
        }
      />
    </ReferenceInput>
  );
};