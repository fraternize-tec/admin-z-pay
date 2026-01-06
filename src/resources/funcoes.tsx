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
    </SimpleForm>
  </Create>
);

/* ================= EDIT ================= */
export const FuncaoEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="codigo" label="Código" fullWidth />
      <TextInput source="descricao" label="Descrição" fullWidth />
    </SimpleForm>
  </Edit>
);
