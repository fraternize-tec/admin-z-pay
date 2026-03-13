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
} from 'react-admin';

import { EscopoField } from './escopoField';
import { UsuarioPermissoesTab } from './usuarioPermissoesTab';

/* ================= LIST ================= */
export const UsuarioList = () => (
  <List>
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
        state={{ usuario_id: record.id }}
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

/* ================= EDIT ================= */
export const UsuarioEdit = () => (
  <Edit>
    <>
      {/* FORMULÁRIO */}
      <SimpleForm>
        <TextInput source="nome" fullWidth />
        <TextInput source="email" fullWidth disabled />
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
      >
        <SelectInput optionText="codigo" />
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
      />

      <FormDataConsumer>
        {({ formData }) => {

          if (!formData.escopo_tipo) return null;

          return (
            <>
              {/* EVENTO COMO ESCOPO */}
              {formData.escopo_tipo === "evento" && (
                <ReferenceInput
                  source="escopo_id"
                  reference="eventos"
                  label="Evento"
                >
                  <SelectInput optionText="nome" />
                </ReferenceInput>
              )}

              {/* PDV */}
              {formData.escopo_tipo === "pdv" && (
                <>
                  <ReferenceInput
                    source="evento_id"
                    reference="eventos"
                    label="Evento"
                  >
                    <SelectInput optionText="nome" />
                  </ReferenceInput>

                  {formData.evento_id && (
                    <ReferenceInput
                      source="escopo_id"
                      reference="pontos_de_venda"
                      filter={{ evento_id: formData.evento_id }}
                      label="PDV"
                    >
                      <SelectInput optionText="nome" />
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
                  >
                    <SelectInput optionText="nome" />
                  </ReferenceInput>

                  {formData.evento_id && (
                    <ReferenceInput
                      source="escopo_id"
                      reference="caixas"
                      filter={{ evento_id: formData.evento_id }}
                      label="Caixa"
                    >
                      <SelectInput optionText="nome" />
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