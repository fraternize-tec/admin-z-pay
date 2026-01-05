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
    TextInput,
    NumberInput,
    BooleanInput,
    ReferenceInput,
    ReferenceField,
    SelectInput,
    required,
} from 'react-admin';

/* ================= LIST ================= */
export const ItemList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="nome" label="Item" />

            <ReferenceField
                source="evento_id"
                reference="eventos"
                label="Evento"
            >
                <TextField source="nome" />
            </ReferenceField>

            <NumberField
                source="preco_padrao"
                label="Preço padrão"
                options={{ style: 'currency', currency: 'BRL' }}
            />

            <BooleanField source="ativo" label="Ativo" />
            <DateField source="criado_em" label="Criado em" />
        </Datagrid>
    </List>
);

/* ================= CREATE ================= */
export const ItemCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput
                source="nome"
                label="Nome do item"
                fullWidth
                validate={required()}
            />

            <ReferenceInput
                source="evento_id"
                reference="eventos"
            >
                <SelectInput
                    optionText="nome"
                    label="Evento"
                    validate={required()}
                />
            </ReferenceInput>

            <NumberInput
                source="preco_padrao"
                label="Preço padrão"
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
export const ItemEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="nome" label="Nome do item" fullWidth />

            <ReferenceInput
                source="evento_id"
                reference="eventos"
            >
                <SelectInput optionText="nome" label="Evento" />
            </ReferenceInput>

            <NumberInput
                source="preco_padrao"
                label="Preço padrão"
                min={0}
            />

            <BooleanInput source="ativo" label="Ativo" />
        </SimpleForm>
    </Edit>
);
