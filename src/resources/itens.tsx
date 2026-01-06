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
    FunctionField,
} from 'react-admin';
import { formatBRL } from '../utils/formatters';

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

            <FunctionField
                source="preco_padrao"
                label="Preço padrão"
                render={(record) => formatBRL(record.preco_padrao)}
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
                parse={(v) => Number(v)}
                format={(v) =>
                    new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(v ?? 0)
                }
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
                parse={(v) => Number(v)}
                format={(v) =>
                    new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(v ?? 0)
                }
            />

            <BooleanInput source="ativo" label="Ativo" />
        </SimpleForm>
    </Edit>
);
