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
} from 'react-admin';

import { EscopoField } from './escopoField';
import { UsuarioPermissoesTab } from './usuarioPermissoesTab';
import { EscopoSelector } from '../components/EscopoSelector';
import { useLocation, useSearchParams } from 'react-router-dom';
import { BackToListButtonNavigate } from '../components/BackToListButton';

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
    </Datagrid>
  </List>
);

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
      >
        <Datagrid
          bulkActionButtons={<BulkDeleteButton />}
        >
          <ReferenceField
            source="papel_id"
            reference="funcoes_sistema"
            label="Papel"
          >
            <TextField source="codigo" />
          </ReferenceField>

          <ReferenceFieldWithEscopoSelector />

          <EscopoField />
        </Datagrid>
      </ReferenceManyField>
    </>
  );
};

const ReferenceFieldWithEscopoSelector = () => {
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
        <ReenviarConviteButton />
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