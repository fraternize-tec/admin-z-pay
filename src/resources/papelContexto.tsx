import {
  Create,
  SimpleForm,
  ReferenceInput,
  required,
  FormDataConsumer,
  useRedirect,
  AutocompleteInput,
  useGetOne,
  Edit,
  TextField,
  ReferenceField,
  useRecordContext,
  ArrayInput,
  SimpleFormIterator,
  useSimpleFormIterator,
  useSimpleFormIteratorItem,
  useNotify,
} from 'react-admin';
import { useLocation } from 'react-router-dom';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { EscopoSelector } from '../components/EscopoSelector';
import { VigenciaFromEvento } from '../components/VigenciaFromEvento';
import { Box, Button, Chip, Divider, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useMemo } from 'react';
import { SmartToolbar } from '../components/SmartToolbar';

const PapelContextoActions = () => (
  <SmartToolbar>
    <BackToListButtonNavigate />
  </SmartToolbar>
);

const PapelItemHeader = ({ papelId }: { papelId?: string | number }) => {
  const { index, remove } = useSimpleFormIteratorItem();
  const { total } = useSimpleFormIterator();

  const { data: funcao } = useGetOne(
    "funcoes_sistema",
    { id: papelId },
    { enabled: !!papelId }
  );

  return (
    <Box mb={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Papel #{index + 1}
          </Typography>
          {funcao?.escopo_tipo && (
            <Chip
              label={`Escopo: ${funcao.escopo_tipo.toUpperCase()}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {total > 1 && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => remove()}
            sx={{ py: 0.5, px: 1.5 }}
          >
            Remover
          </Button>
        )}
      </Box>
      <Divider />
    </Box>
  );
};

const AdicionarPapelButton = () => {
  const { add } = useSimpleFormIterator();

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<AddCircleOutlineIcon />}
      onClick={() => add()}
      sx={{ mt: 1 }}
    >
      Adicionar outro papel
    </Button>
  );
};

export const PapeisArrayInput = () => (
  <ArrayInput
    source="papeis"
    label="Papéis e Permissões"
    validate={required()}
  >
    <SimpleFormIterator
      inline={false}
      disableReordering
      disableClear
      fullWidth
      addButton={<AdicionarPapelButton />}
      sx={{
        mt: 1,
        '& .RaSimpleFormIterator-list': {
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        },
        '& .RaSimpleFormIterator-line': {
          border: 1,
          borderColor: 'divider',
          borderBottom: 1,
          borderBottomColor: 'divider',
          borderRadius: 3,
          p: 2.5,
          bgcolor: 'action.hover',
        },
        '& .RaSimpleFormIterator-line:last-child': {
          borderBottom: 1,
          borderBottomColor: 'divider',
        },
        '& .RaSimpleFormIterator-action': {
          display: 'none',
        },
        '& .RaSimpleFormIterator-index': {
          display: 'none',
        },
      }}
    >
      <FormDataConsumer>
        {({ scopedFormData }) => (
          <PapelItemHeader papelId={scopedFormData?.papel_id} />
        )}
      </FormDataConsumer>

      <ReferenceInput
        source="papel_id"
        reference="funcoes_sistema"
        perPage={50}
      >
        <AutocompleteInput
          optionText="codigo"
          label="Papel"
          validate={required()}
          fullWidth
        />
      </ReferenceInput>

      <FormDataConsumer>
        {({ scopedFormData }) =>
          scopedFormData?.papel_id ? (
            <EscopoFromPapel papelId={scopedFormData.papel_id} />
          ) : null
        }
      </FormDataConsumer>
    </SimpleFormIterator>
  </ArrayInput>
);

export const PapelContextoCreate = () => {
  const { state } = useLocation();
  const redirect = useRedirect();
  const notify = useNotify();

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
          notify("Papéis vinculados com sucesso", { type: "success" });
          redirect(`/usuarios/${state?.usuario_id}`);
        },
      }}
    >
      <SimpleForm
        defaultValues={{
          papeis: [{}],
        }}
      >

        {/* USUÁRIO */}
        <div style={{ marginBottom: '1em' }}>
          <b>Usuário:</b> {state?.email ?? ''}
        </div>

        <PapeisArrayInput />

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