import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    DateField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    required,
    ReferenceField,
} from 'react-admin';

/* ================= LIST ================= */
export const PontoDeVendaList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="nome" label="Nome" />
            <TextField source="localizacao" label="Localização" />

            <ReferenceField
                source="evento_id"
                reference="eventos"
                label="Evento"
            >
                <TextField source="nome" />
            </ReferenceField>

            <BooleanField source="ativo" label="Ativo" />
            <DateField source="criado_em" label="Criado em" />
        </Datagrid>
    </List>
);

/* ================= CREATE ================= */
export const PontoDeVendaCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput
                source="nome"
                label="Nome"
                fullWidth
                validate={required()}
            />

            <TextInput
                source="localizacao"
                label="Localização"
                fullWidth
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


            <BooleanInput
                source="ativo"
                label="Ativo"
                defaultValue
            />
        </SimpleForm>
    </Create>
);

/* ================= EDIT ================= */
export const PontoDeVendaEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="nome" label="Nome" fullWidth />

            <TextInput
                source="localizacao"
                label="Localização"
                fullWidth
            />

            <ReferenceInput
                source="evento_id"
                reference="eventos"
            >
                <SelectInput optionText="nome" label="Evento" />
            </ReferenceInput>

            <BooleanInput source="ativo" label="Ativo" />
        </SimpleForm>
    </Edit>
);
