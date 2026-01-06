import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
} from 'react-admin';

/* ================= LIST ================= */
export const UsuarioList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="nome" label="Nome" />
      <TextField source="email" label="Email" />
      <DateField source="criado_em" label="Criado em" />
    </Datagrid>
  </List>
);

/* ================= EDIT ================= */
export const UsuarioEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="nome" label="Nome" fullWidth />
      <TextInput source="email" label="Email" fullWidth disabled />
    </SimpleForm>
  </Edit>
);
