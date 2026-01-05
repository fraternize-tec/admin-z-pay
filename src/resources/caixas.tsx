import {
    List,
    Datagrid,
    TextField,
    DateField,
    Edit,
    Create,
    SimpleForm,
    ReferenceInput,
    ReferenceField,
    SelectInput,
    required,
    FunctionField,
} from 'react-admin';

export const CaixaList = () => (
    <List>
        <Datagrid rowClick="edit">
            <ReferenceField
                source="evento_id"
                reference="eventos"
                label="Evento"
            >
                <TextField source="nome" />
            </ReferenceField>

            <FunctionField
                label="PDV"
                render={(record: any) =>
                    record.pdv_id ? (
                        <ReferenceField
                            source="pdv_id"
                            reference="pontos_de_venda"
                            record={record}
                        >
                            <TextField source="nome" />
                        </ReferenceField>
                    ) : (
                        '—'
                    )
                }
            />

            <TextField source="status" label="Status" />
            <DateField source="aberto_em" label="Aberto em" />
            <DateField source="fechado_em" label="Fechado em" />
        </Datagrid>
    </List>
);

/* ================= CREATE (Abrir Caixa) ================= */
export const CaixaCreate = () => (
    <Create>
        <SimpleForm>
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

            <ReferenceInput
                source="pdv_id"
                reference="pontos_de_venda"

            >
                <SelectInput optionText="nome" label="PDV" validate={required()} />
            </ReferenceInput>

            {/* status, aberto_por e aberto_em
          devem ser preenchidos no backend */}
        </SimpleForm>
    </Create>
);

/* ================= EDIT (Fechar Caixa) ================= */
export const CaixaEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceField
                source="evento_id"
                reference="eventos"
                label="Evento"
            >
                <TextField source="nome" />
            </ReferenceField>

            <ReferenceField
                source="pdv_id"
                reference="pontos_de_venda"
                label="PDV"
            >
                <TextField source="nome" />
            </ReferenceField>

            <TextField source="status" label="Status" />
            <DateField source="aberto_em" label="Aberto em" />
            <DateField source="fechado_em" label="Fechado em" />
        </SimpleForm>
    </Edit>
);
