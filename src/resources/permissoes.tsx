import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';

/* ================= LIST ================= */
export const PermissaoList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="codigo" label="Código" />
      <TextField source="descricao" label="Descrição" />
      <TextField source="categoria" label="Categoria" />
    </Datagrid>
  </List>
);

/* ================= CREATE ================= */
export const PermissaoCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput
        source="codigo"
        label="Código"
        validate={required()}
        fullWidth
      />
      <TextInput
        source="descricao"
        label="Descrição"
        fullWidth
      />
      <TextInput
        source="categoria"
        label="Categoria"
        fullWidth
      />
    </SimpleForm>
  </Create>
);

/* ================= EDIT ================= */
export const PermissaoEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="codigo" label="Código" fullWidth />
      <TextInput source="descricao" label="Descrição" fullWidth />
      <TextInput source="categoria" label="Categoria" fullWidth />
    </SimpleForm>
  </Edit>
);
