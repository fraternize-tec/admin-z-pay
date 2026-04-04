import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  TextInput,
  SimpleForm,
  ReferenceManyField,
  ReferenceField,
  DeleteButton,
  CreateButton,
  TabbedShowLayout,
  Tab,
  Show,
  useRecordContext,
  BulkDeleteButton,
  Create,
  required,
  ReferenceInput,
  SelectInput,
  FormDataConsumer,
  Button,
  useDataProvider,
  useNotify,
  AutocompleteInput,
  useGetOne,
  TopToolbar,
  FunctionField,
  useUpdate,
  useRefresh,
} from 'react-admin';

import { EscopoField } from './escopoField';
import { UsuarioPermissoesTab } from './usuarioPermissoesTab';
import { EscopoSelector } from '../components/EscopoSelector';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { Box, Chip } from '@mui/material';

const usuarioFilters = [
  <TextInput source="nome" label="Nome" alwaysOn />,
  <TextInput source="email" label="Email" alwaysOn />
];

const UsuarioActions = () => {
  return (
    <TopToolbar>
      <BackToListButtonNavigate />
    </TopToolbar>
  );
};

/* ================= LIST ================= */
export const UsuarioList = () => (
  <List filters={usuarioFilters} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="nome" />
      <TextField source="email" />
      <DateField source="criado_em" />
      <FunctionField
        label="Status"
        render={(record) =>
          record.ativo ? "Ativo" : "Inativo"
        }
      />
    </Datagrid>
  </List>
);

const StatusVigenciaField = (props: any) => {

  const record = useRecordContext();

  if (!record) return null;

  const now = new Date();

  const inicio = record.inicio ? new Date(record.inicio) : null;
  const fim = record.fim ? new Date(record.fim) : null;

  let label = "Ativo";
  let color: "success" | "warning" | "default" = "success";

  if (inicio && inicio > now) {
    label = "Futuro";
    color = "warning";
  }

  if (fim && fim < now) {
    label = "Encerrado";
    color = "default";
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
    />
  );
};

const EncerrarPermissaoButton = (props: any) => {

  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;

  const handleClick = () => {
    update(
      "papel_contexto",
      {
        id: record.id,
        data: {
          fim: new Date()
        },
        previousData: record
      },
      {
        onSuccess: () => {
          notify("Permissão encerrada");
          refresh();
        }
      }
    );
  };

  return (
    <Button
      label="Encerrar"
      color="warning"
      onClick={handleClick}
      disabled={isLoading || record.fim}
    />
  );
};

/* ================= PAPÉIS TAB ================= */
const UsuarioPapeisTab = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <>
      <CreateButton
        resource="papel_contexto"
        label="Adicionar papel"
        state={{ usuario_id: record.id, email: record.email }}
        sx={{ mb: 2 }}
      />


      <ReferenceManyField
        reference="papel_contexto"
        target="usuario_id"
        sort={{ field: "inicio", order: "DESC" }}
      >
        <Datagrid bulkActionButtons={<BulkDeleteButton />}>

          <StatusVigenciaField label="Status" />

          <ReferenceField
            source="papel_id"
            reference="funcoes_sistema"
            label="Papel"
          >
            <TextField source="codigo" />
          </ReferenceField>

          <ReferenceFieldWithEscopoSelector label="Escopo" />

          <DateField source="inicio" label="Início" />
          <DateField source="fim" label="Fim" />

          <EncerrarPermissaoButton label="Ações" />

        </Datagrid>
      </ReferenceManyField>
    </>
  );
};

const ReferenceFieldWithEscopoSelector = (props: any) => {
  const record = useRecordContext();
  const { data: funcao } = useGetOne(
    "funcoes_sistema",
    { id: record?.papel_id },
    { enabled: !!record?.papel_id }
  );

  return (
    <ReferenceField
      source="escopo_id"
      reference={
        funcao?.escopo_tipo === "evento"
          ? "eventos"
          : funcao?.escopo_tipo === "pdv"
            ? "pontos_de_venda"
            : "caixas"
      }
      label="Escopo"
    >
      <TextField source="nome" />
    </ReferenceField>
  );
};
const ToggleUsuarioButton = () => {
  const record = useRecordContext();
  const [update, { isLoading }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;

  const handleClick = () => {
    update(
      "usuarios",
      {
        id: record.id,
        data: {
          ativo: !record.ativo
        },
        previousData: record
      },
      {
        onSuccess: () => {
          notify("Usuário atualizado");
          refresh();
        }
      }
    );
  };

  return (
    <Button
      label={record.ativo ? "Desativar" : "Ativar"}
      color={record.ativo ? "error" : "success"}
      onClick={handleClick}
      disabled={isLoading}
    />
  );
};

export const ReenviarConviteButton = () => {

  const record = useRecordContext()
  const notify = useNotify()
  const dataProvider = useDataProvider()

  const handleClick = async () => {
    if (!record) {
      notify("Registro não encontrado", { type: "error" });
      return;
    }

    try {

      await dataProvider.create("reenviar-convite", {
        data: { email: record.email }
      })

      notify("Convite reenviado com sucesso", { type: "info" })

    } catch (e) {

      notify(e instanceof Error ? e.message : "Erro desconhecido", { type: "error" })

    }
  }

  return (
    <Button
      label="Reenviar convite"
      onClick={handleClick}
    />
  )
}

/* ================= EDIT ================= */
export const UsuarioEdit = () => (
  <Edit actions={<UsuarioActions />}>
    <>
      {/* FORMULÁRIO */}
      <SimpleForm>
        <TextInput source="nome" fullWidth />
        <TextInput source="email" fullWidth disabled />

        <Box mb={2}>
          <FunctionField
            label="Status"
            render={(record) =>
              record.ativo ? (
                <Chip label="Ativo" color="success" size="small" />
              ) : (
                <Chip label="Inativo" color="error" size="small" />
              )
            }
          />
        </Box>

        <Box mt={1} display="flex" gap={1}>
          <ToggleUsuarioButton />
          <ReenviarConviteButton />
        </Box>

      </SimpleForm>

      {/* VISUALIZAÇÕES */}
      <Show actions={false}>
        <TabbedShowLayout>
          <Tab label="Papéis e Contextos">
            <UsuarioPapeisTab />
          </Tab>

          <Tab label="Permissões Efetivas">
            <UsuarioPermissoesTab />
          </Tab>
        </TabbedShowLayout>
      </Show>
    </>
  </Edit>
);

export const UsuarioCreate = () => {

  const [searchParams] = useSearchParams();
  const caixa_id = searchParams.get("caixa_id");

  const { data: caixa } = useGetOne(
    "caixas",
    { id: caixa_id },
    { enabled: !!caixa_id }
  );

  return (
    <Create actions={<UsuarioActions />}>
      <SimpleForm>

        <TextInput
          source="email"
          fullWidth
          validate={required()}
        />

        {/* PAPEL */}
        {caixa_id ? (
          <TextInput
            source="papel_codigo"
            label="Papel"
            defaultValue="OPERADOR_CAIXA"
            disabled
            fullWidth
          />
        ) : (
          <ReferenceInput
            source="papel_id"
            reference="funcoes_sistema"
            perPage={50}
          >
            <AutocompleteInput optionText="codigo" fullWidth />
          </ReferenceInput>
        )}

        <FormDataConsumer>
          {({ formData }) => {

            const papel_id = formData?.papel_id;

            const { data: funcao } = useGetOne(
              "funcoes_sistema",
              { id: papel_id },
              { enabled: !!papel_id }
            );

            const escopoFromFuncao = funcao?.escopo_tipo;

            return (
              <EscopoSelector
                fixedEscopo={caixa ? "caixa" : escopoFromFuncao}
                fixedEscopoId={caixa?.id}
              />
            );
          }}
        </FormDataConsumer>

      </SimpleForm>
    </Create>
  );
};