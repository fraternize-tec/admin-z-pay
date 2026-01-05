import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  Edit,
  Create,
  SimpleForm,
  NumberInput,
  BooleanInput,
  ReferenceInput,
  ReferenceField,
  SelectInput,
  required,
} from 'react-admin';

/* ================= LIST ================= */
export const ItemPdvList = () => (
  <List>
    <Datagrid rowClick="edit">
      <ReferenceField
        source="pdv_id"
        reference="pontos_de_venda"
        label="PDV"
      >
        <TextField source="nome" />
      </ReferenceField>

      <ReferenceField
        source="item_id"
        reference="itens"
        label="Item"
      >
        <TextField source="nome" />
      </ReferenceField>

      <NumberField
        source="preco"
        label="Preço no PDV"
        options={{ style: 'currency', currency: 'BRL' }}
      />

      <BooleanField source="ativo" label="Ativo" />
      <DateField source="criado_em" label="Criado em" />
    </Datagrid>
  </List>
);

/* ================= CREATE ================= */
export const ItemPdvCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput
        source="pdv_id"
        reference="pontos_de_venda"
        validate={required()}
      >
        <SelectInput optionText="nome" label="PDV" />
      </ReferenceInput>

      <ReferenceInput
        source="item_id"
        reference="itens"
        validate={required()}
      >
        <SelectInput optionText="nome" label="Item" />
      </ReferenceInput>

      <NumberInput
        source="preco"
        label="Preço no PDV"
        validate={required()}
        min={0}
      />

      <BooleanInput
        source="ativo"
        label="Ativo"
        defaultValue
      />
    </SimpleForm>
  </Create>
);

/* ================= EDIT ================= */
export const ItemPdvEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput
        source="pdv_id"
        reference="pontos_de_venda"
      >
        <SelectInput optionText="nome" label="PDV" />
      </ReferenceInput>

      <ReferenceInput
        source="item_id"
        reference="itens"
      >
        <SelectInput optionText="nome" label="Item" />
      </ReferenceInput>

      <NumberInput
        source="preco"
        label="Preço no PDV"
        min={0}
      />

      <BooleanInput source="ativo" label="Ativo" />
    </SimpleForm>
  </Edit>
);
