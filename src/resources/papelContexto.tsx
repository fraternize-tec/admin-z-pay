import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  required,
  TextInput,
} from 'react-admin';

/* ================= LIST ================= */
export const PapelContextoList = () => (
  <List>
    <Datagrid rowClick="edit">
      <ReferenceField
        source="usuario_id"
        reference="usuarios"
        label="Usuário"
      >
        <TextField source="email" />
      </ReferenceField>

      <ReferenceField
        source="papel_id"
        reference="funcoes_sistema"
        label="Papel"
      >
        <TextField source="codigo" />
      </ReferenceField>

      <TextField source="escopo_tipo" label="Escopo" />
      <TextField source="escopo_id" label="ID do Escopo" />
    </Datagrid>
  </List>
);


/* ================= CREATE ================= */
export const PapelContextoCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput
        source="usuario_id"
        reference="usuarios"
      >
        <SelectInput
          optionText="email"
          label="Usuário"
          validate={required()}
        />
      </ReferenceInput>

      <ReferenceInput
        source="papel_id"
        reference="funcoes_sistema"
      >
        <SelectInput
          optionText="codigo"
          label="Papel"
          validate={required()}
        />
      </ReferenceInput>

      <SelectInput
        source="escopo_tipo"
        label="Escopo"
        choices={[
          { id: 'global', name: 'Global' },
          { id: 'evento', name: 'Evento' },
          { id: 'pdv', name: 'PDV' },
          { id: 'caixa', name: 'Caixa' },
        ]}
        validate={required()}
      />

      <TextInput
        source="escopo_id"
        label="ID do Escopo"
      />
    </SimpleForm>
  </Create>
);
