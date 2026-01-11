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


