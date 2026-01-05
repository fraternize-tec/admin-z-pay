import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  DateTimeInput,
  BooleanInput,
  SelectInput,
  required,
} from 'react-admin';

/* ========= LIST ========= */
export const EventoList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="nome" />
      <TextField source="localidade" />
      <DateField source="inicio" />
      <DateField source="fim" />
      <TextField source="tipo_evento" />
      <BooleanField source="ativo" />
    </Datagrid>
  </List>
);

/* ========= CREATE ========= */
export const EventoCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="nome" validate={required()} fullWidth />
      <TextInput source="descricao" multiline fullWidth />
      <TextInput source="localidade" fullWidth />

      <SelectInput
        source="tipo_evento"
        choices={[
          { id: 'fixo', name: 'Fixo' },
          { id: 'indefinido', name: 'Indefinido' },
        ]}
      />

      <DateTimeInput source="inicio" />
      <DateTimeInput source="fim" />
      <BooleanInput source="ativo" defaultValue />
    </SimpleForm>
  </Create>
);

/* ========= EDIT ========= */
export const EventoEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="nome" fullWidth />
      <TextInput source="descricao" multiline fullWidth />
      <TextInput source="localidade" fullWidth />

      <SelectInput
        source="tipo_evento"
        choices={[
          { id: 'fixo', name: 'Fixo' },
          { id: 'indefinido', name: 'Indefinido' },
        ]}
      />

      <DateTimeInput source="inicio" />
      <DateTimeInput source="fim" />
      <BooleanInput source="ativo" />
    </SimpleForm>
  </Edit>
);
