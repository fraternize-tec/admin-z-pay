import {
  ReferenceField,
  TextField,
  ReferenceInput,
  SelectInput,
  FormDataConsumer,
  AutocompleteInput,
  useGetOne,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import { VigenciaFromEvento } from "./VigenciaFromEvento";
import { useEffect } from "react";

type EscopoSelectorProps = {
  fixedEscopo?: "global" | "evento" | "pdv" | "caixa";
  fixedEscopoId?: string | number;
  fixedEventoId?: string | number;
};

export const EscopoSelector = ({
  fixedEscopo,
  fixedEscopoId,
  fixedEventoId,
}: EscopoSelectorProps) => {

  const { setValue } = useFormContext(); // 👈 adicionar isso

  useEffect(() => {
    if (fixedEscopo || fixedEscopoId) {
      requestAnimationFrame(() => {
        if (fixedEscopo) {
          setValue("escopo_tipo", fixedEscopo);
        }

        if (fixedEscopoId) {
          setValue("escopo_id", fixedEscopoId);
        }

        if (fixedEventoId) {
          setValue("evento_id", fixedEventoId);
        }
      });
    }
  }, [fixedEscopo, fixedEscopoId, fixedEventoId]);


  const { data: caixa } = useGetOne(
    "caixas",
    { id: fixedEscopoId },
    {
      enabled: fixedEscopo === "caixa" && !!fixedEscopoId
    }
  );

  const { data: pdv } = useGetOne(
    "pontos_de_venda",
    { id: fixedEscopoId },
    {
      enabled: fixedEscopo === "pdv" && !!fixedEscopoId
    }
  );

  console.log({ caixa, pdv });

  if (!fixedEscopo) return null;

  if (fixedEscopo && fixedEscopoId) {

    const eventoId = fixedEventoId ? 
    fixedEventoId
     : fixedEscopo === "evento"
        ? fixedEscopoId
        : fixedEscopo === "caixa"
          ? caixa?.evento_id
          : fixedEscopo === "pdv"
            ? pdv?.evento_id
            : null;

    return (
      <>
        <ReferenceField
          source="escopo_id"
          reference={
            fixedEscopo === "evento"
              ? "eventos"
              : fixedEscopo === "pdv"
                ? "pontos_de_venda"
                : "caixas"
          }
          record={{ escopo_id: fixedEscopoId }}
          label="Escopo"
        >
          <TextField source="nome" />
        </ReferenceField>

        {eventoId && (
          <VigenciaFromEvento
            key={eventoId}
            eventoId={eventoId}
          />
        )}
      </>
    );
  }

  // comportamento dinâmico
  return (
    <>
      {fixedEscopo === "evento" && (
        <>
          <ReferenceInput source="escopo_id" reference="eventos">
            <AutocompleteInput
              optionText="nome"
              label="Evento"
              fullWidth
            />
          </ReferenceInput>

          <FormDataConsumer>
            {({ formData }) =>
              formData.escopo_id && (
                <VigenciaFromEvento key={formData.escopo_id} eventoId={formData.escopo_id} restrictToEvento={false} />
              )
            }
          </FormDataConsumer>
        </>
      )}

      {fixedEscopo === "pdv" && (
        <>
          <ReferenceInput source="evento_id" reference="eventos">
            <AutocompleteInput optionText="nome" fullWidth />
          </ReferenceInput>

          <FormDataConsumer>
            {({ formData }) =>
              formData.evento_id && (
                <>
                  <ReferenceInput
                    source="escopo_id"
                    reference="pontos_de_venda"
                    filter={{ evento_id: formData.evento_id }}
                  >
                    <AutocompleteInput
                      optionText="nome"
                      label="PDV"
                      fullWidth
                    />
                  </ReferenceInput>

                  <VigenciaFromEvento key={formData.escopo_id} eventoId={formData.evento_id} />
                </>
              )
            }
          </FormDataConsumer>
        </>
      )}

      {fixedEscopo === "caixa" && (
        <>
          <ReferenceInput source="evento_id" reference="eventos">
            <AutocompleteInput optionText="nome" fullWidth />
          </ReferenceInput>

          <FormDataConsumer>
            {({ formData }) =>
              formData.evento_id && (
                <>
                  <ReferenceInput
                    source="escopo_id"
                    reference="caixas"
                    filter={{ evento_id: formData.evento_id }}
                  >
                    <AutocompleteInput
                      optionText="nome"
                      label="Caixa"
                      fullWidth
                    />
                  </ReferenceInput>

                  <VigenciaFromEvento key={formData.escopo_id} eventoId={formData.evento_id} />
                </>
              )
            }
          </FormDataConsumer>
        </>
      )}
    </>
  );
};
