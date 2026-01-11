import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  required,
  ReferenceManyField,
  ReferenceField,
  CreateButton,
  BulkDeleteButton,
  TabbedShowLayout,
  Tab,
  Show,
  useRecordContext,
} from 'react-admin';

/* ================= LIST ================= */
export const FuncaoList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="codigo" label="Código" />
      <TextField source="descricao" label="Descrição" />
    </Datagrid>
  </List>
);

/* ================= CREATE ================= */
export const FuncaoCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="codigo" validate={required()} fullWidth />
      <TextInput source="descricao" fullWidth />
    </SimpleForm>
  </Create>
);

/* ================= TAB: PERMISSÕES ================= */
const FuncaoPermissoesTab = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <>
      <CreateButton
        resource="papel_permissoes"
        label="Adicionar permissão"
        state={{ papel_id: record.id }}
        sx={{ mb: 2 }}
      />

      <ReferenceManyField
        reference="papel_permissoes"
        target="papel_id"
      >
        <Datagrid bulkActionButtons={<BulkDeleteButton />}>
          <ReferenceField
            source="permissao_id"
            reference="permissoes"
            label="Permissão"
          >
            <TextField source="codigo" />
          </ReferenceField>

          <ReferenceField
            source="permissao_id"
            reference="permissoes"
            label="Categoria"
          >
            <TextField source="categoria" />
          </ReferenceField>
        </Datagrid>
      </ReferenceManyField>
    </>
  );
};

/* ================= EDIT ================= */
export const FuncaoEdit = () => (
  <Edit>
    <>
      <SimpleForm>
        <TextInput source="codigo" fullWidth />
        <TextInput source="descricao" fullWidth />
      </SimpleForm>

      <Show actions={false}>
        <TabbedShowLayout>
          <Tab label="Permissões">
            <FuncaoPermissoesTab />
          </Tab>
        </TabbedShowLayout>
      </Show>
    </>
  </Edit>
);
