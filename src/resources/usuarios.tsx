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
} from 'react-admin';

import { EscopoField } from './escopoField';
import { UsuarioPermissoesTab } from './usuarioPermissoesTab';

const usuarioFilters = [
  <TextInput source="nome" label="Nome" alwaysOn />,
  <TextInput source="email" label="Email" alwaysOn />
];

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

          <EscopoField />
        </Datagrid>
      </ReferenceManyField>
    </>
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
  <Edit>
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

export const UsuarioCreate = () => (

  <Create>
    <SimpleForm>

      {/* EMAIL */}
      <TextInput
        source="email"
        fullWidth
        validate={required()}
      />

      {/* PAPEL */}
      <ReferenceInput
        source="papel_id"
        reference="funcoes_sistema"
        label="Papel"
        perPage={50}
      >
        <AutocompleteInput
          optionText="codigo"
          debounce={350}
          sx={{ minWidth: 250, maxWidth: 500 }}
        />
      </ReferenceInput>

      {/* ESCOPO */}
      <SelectInput
        source="escopo_tipo"
        label="Escopo"
        choices={[
          { id: "global", name: "Global" },
          { id: "evento", name: "Evento" },
          { id: "pdv", name: "PDV" },
          { id: "caixa", name: "Caixa" }
        ]}
        validate={required()}
      />

      <FormDataConsumer>
        {({ formData }) => {

          if (!formData.escopo_tipo) return null;

          return (
            <>
              {/* EVENTO */}
              {formData.escopo_tipo === "evento" && (
                <ReferenceInput
                  source="escopo_id"
                  reference="eventos"
                  label="Evento"
                  perPage={50}
                >
                  <AutocompleteInput
                    optionText="nome"
                    debounce={350}
                    sx={{ minWidth: 250, maxWidth: 500 }}
                  />
                </ReferenceInput>
              )}

              {/* PDV */}
              {formData.escopo_tipo === "pdv" && (
                <>
                  <ReferenceInput
                    source="evento_id"
                    reference="eventos"
                    label="Evento"
                    perPage={50}
                  >
                    <AutocompleteInput
                      optionText="nome"
                      debounce={350}
                      sx={{ minWidth: 250, maxWidth: 500 }}
                    />
                  </ReferenceInput>

                  {formData.evento_id && (
                    <ReferenceInput
                      source="escopo_id"
                      reference="pontos_de_venda"
                      filter={{ evento_id: formData.evento_id }}
                      label="PDV"
                    >
                      <AutocompleteInput
                        optionText="nome"
                        debounce={350}
                        sx={{ minWidth: 250, maxWidth: 500 }}
                      />
                    </ReferenceInput>
                  )}
                </>
              )}

              {/* CAIXA */}
              {formData.escopo_tipo === "caixa" && (
                <>
                  <ReferenceInput
                    source="evento_id"
                    reference="eventos"
                    label="Evento"
                    perPage={50}
                  >
                    <AutocompleteInput
                      optionText="nome"
                      debounce={350}
                      sx={{ minWidth: 250, maxWidth: 500 }}
                    />
                  </ReferenceInput>

                  {formData.evento_id && (
                    <ReferenceInput
                      source="escopo_id"
                      reference="caixas"
                      filter={{ evento_id: formData.evento_id }}
                      label="Caixa"
                    >
                      <AutocompleteInput
                        optionText="nome"
                        debounce={350}
                        sx={{ minWidth: 250, maxWidth: 500 }}
                      />
                    </ReferenceInput>
                  )}
                </>
              )}

            </>
          );
        }}
      </FormDataConsumer>

    </SimpleForm>
  </Create>
);