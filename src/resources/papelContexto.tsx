import {
  Create,
  SimpleForm,
  ReferenceInput,
  required,
  FormDataConsumer,
  useRedirect,
  TopToolbar,
  AutocompleteInput,
  useGetOne,
  Edit,
  DateField,
  TextField,
  ReferenceField,
  useRecordContext,
  Identifier,
  RaRecord,
} from 'react-admin';
import { useLocation } from 'react-router-dom';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { EscopoSelector } from '../components/EscopoSelector';
import { VigenciaFromEvento } from '../components/VigenciaFromEvento';
import { Box, Chip, Divider, Typography } from '@mui/material';
import { useMemo } from 'react';

const PapelContextoActions = () => (
  <TopToolbar>
    <BackToListButtonNavigate />
  </TopToolbar>
);

export const PapelContextoCreate = () => {
  const { state } = useLocation();
  const redirect = useRedirect();

  return (
    <Create
      actions={<PapelContextoActions />}
      transform={(data) => ({
        ...data,
        usuario_id: state?.usuario_id,
        evento_id: undefined,
      })}
      mutationOptions={{
        onSuccess: () => {
          redirect(`/usuarios/${state?.usuario_id}`);
        },
      }}
    >
      <SimpleForm>

        {/* USUÁRIO */}
        <div style={{ marginBottom: '1em' }}>
          <b>Usuário:</b> {state?.email ?? ''}
        </div>

        {/* PAPEL */}
        <ReferenceInput
          source="papel_id"
          reference="funcoes_sistema"
        >
          <AutocompleteInput
            optionText="codigo"
            validate={required()}
            fullWidth
          />
        </ReferenceInput>

        {/* ESCOPOS DINÂMICOS */}
        <FormDataConsumer>
          {({ formData }) => {

            if (!formData.papel_id) return null;

            return (
              <EscopoFromPapel papelId={formData.papel_id} />
            );
          }}
        </FormDataConsumer>

      </SimpleForm>
    </Create>
  );
};

export const PapelContextoEdit = () => {

  const redirect = useRedirect();

  return (
    <Edit
    mutationMode="pessimistic"
      actions={<PapelContextoActions />}
      mutationOptions={{
        onSuccess: (data) => {
          redirect(`/usuarios/${data.usuario_id}`);
        }
      }}
    >
      <SimpleForm>
        <PapelContextoInfo />
        <PapelContextoVigencia />
      </SimpleForm>
    </Edit>
  );
};

const PapelContextoEditForm = () => {
  const record = useRecordContext();

  if (!record) return null;

  return (
    <SimpleForm>
      <PapelContextoInfo />
      <PapelContextoVigencia />
    </SimpleForm>
  );
};

const EscopoNome = () => {

  const record = useRecordContext();

  const { data: evento } = useGetOne(
    "eventos",
    { id: record?.escopo_id },
    { enabled: record?.escopo_tipo === "evento" }
  );

  const { data: caixa } = useGetOne(
    "caixas",
    { id: record?.escopo_id },
    { enabled: record?.escopo_tipo === "caixa" }
  );

  const { data: pdv } = useGetOne(
    "pontos_de_venda",
    { id: record?.escopo_id },
    { enabled: record?.escopo_tipo === "pdv" }
  );

  const nome =
    evento?.nome ||
    caixa?.nome ||
    pdv?.nome;

  return (
    <Chip
      label={nome}
      size="small"
      color="info"
    />
  );
};

const PapelContextoInfo = () => {

  const record = useRecordContext();

  if (!record) return null;

  return (
    <Box mb={2}>

      <Typography variant="h6" gutterBottom>
        Informações da Permissão
      </Typography>

      <Box display="flex" gap={2} mb={1} alignItems="center">

        <ReferenceField
          source="papel_id"
          reference="funcoes_sistema"
        >
          <Chip
            label={<TextField source="codigo" />}
            size="small"
          />
        </ReferenceField>

        <Chip
          label={record.escopo_tipo?.toUpperCase()}
          size="small"
          color="default"
        />

        <EscopoNome />

      </Box>

      <Divider sx={{ mt: 2 }} />

    </Box>
  );
};

const PapelContextoVigenciaInner = ({ record }: { record: any }) => {

  const { data: evento } = useGetEventoFromEscopo(record);

  if (!evento) return null;

  return (
    <Box>
      <Typography variant="h6">
        Vigência
      </Typography>

      <VigenciaFromEvento eventoId={evento.id} />
    </Box>
  );
};

const PapelContextoVigencia = () => {

  const record = useRecordContext();

  if (!record) return null;

  return (
    <PapelContextoVigenciaInner record={record} />
  );
};

const EscopoFromPapel = ({ papelId }: { papelId: string | number }) => {

  const { data: papel } = useGetOne(
    "funcoes_sistema",
    { id: papelId },
    { enabled: !!papelId }
  );

  if (!papel?.escopo_tipo) return null;

  return (
    <EscopoSelector fixedEscopo={papel.escopo_tipo} />
  );
};

const useGetEventoFromEscopo = (record: any) => {

  const isEvento = record?.escopo_tipo === "evento";
  const isCaixa = record?.escopo_tipo === "caixa";
  const isPdv = record?.escopo_tipo === "pdv";

  const { data: caixa } = useGetOne(
    "caixas",
    { id: record?.escopo_id },
    { enabled: isCaixa && !!record?.escopo_id }
  );

  const { data: pdv } = useGetOne(
    "pontos_de_venda",
    { id: record?.escopo_id },
    { enabled: isPdv && !!record?.escopo_id }
  );

  const eventoId = useMemo(() => {
    if (isEvento) return record?.escopo_id;
    if (isCaixa) return caixa?.evento_id;
    if (isPdv) return pdv?.evento_id;
    return undefined;
  }, [isEvento, isCaixa, isPdv, record?.escopo_id, caixa, pdv]);

  const { data: evento } = useGetOne(
    "eventos",
    { id: eventoId },
    { enabled: !!eventoId }
  );

  return { data: evento };
};