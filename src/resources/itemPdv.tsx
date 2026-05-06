import { Box, Card, CardContent, Typography } from "@mui/material";
import { ReferenceManyField, TextField, NumberField, BooleanField, SimpleForm, required, BooleanInput, Datagrid, Edit, EditButton, Create, TextInput, useDataProvider, useNotify, useRedirect, ReferenceField, useGetOne, useRecordContext } from "react-admin";
import { useSearchParams } from "react-router-dom";
import { BackToListButtonNavigate } from "../components/BackToListButton";
import { CurrencyInput } from "../components/CurrencyInputRA";
import { SmartToolbar } from "../components/SmartToolbar";


export const ItensDoPdv = () => (
    <ReferenceManyField
        reference="item_pdv"
        target="pdv_id"
        label="Itens deste PDV"
    >
        <Datagrid bulkActionButtons={false}>
            <ReferenceField source="item_id" reference="itens" label="Item" link={false}>
                <TextField source="nome" />
            </ReferenceField>

            <NumberField source="preco" label="Preço" />
            <BooleanField source="ativo" label="Ativo" />
            <EditButton />
        </Datagrid>
    </ReferenceManyField>
);

const ItemPdvAction = () => {
    return (
        <SmartToolbar>
            <BackToListButtonNavigate />
        </SmartToolbar>
    );
};

export const ItemPdvCreate = () => {
    const [params] = useSearchParams();
    const context = params.get("source")
        ? JSON.parse(params.get("source")!)
        : {};

    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const handleSubmit = async (values: any) => {
        try {
            await dataProvider.create("item_pdv", {
                meta: {
                    rpc: "upsert_item_pdv"
                },
                data: {
                    p_item_pdv_id: null,
                    p_evento_id: context.evento_id,
                    p_pdv_id: context.pdv_id,
                    p_nome: values.nome_item,
                    p_preco: Number(values.preco),
                    p_ativo: Boolean(values.ativo)
                }
            });

            notify("Item criado e vinculado ao PDV");
            redirect("edit", "pontos_de_venda", context.pdv_id);
        } catch (error: any) {
            notify(error.message, { type: "error" });
        }
    };

    return (
        <Create actions={<ItemPdvAction />}>
            <SimpleForm onSubmit={handleSubmit} defaultValues={{ ativo: true }}>
                <ItemPdvForm context={context} />
            </SimpleForm>
        </Create>
    );
};

export const ItemPdvEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const handleSubmit = async (values: any) => {
        try {
            const { data: pdv } = await dataProvider.getOne("pontos_de_venda", {
                id: values.pdv_id
            });

            const payload = {
                p_item_pdv_id: values.id,
                p_evento_id: pdv.evento_id, 
                p_pdv_id: values.pdv_id,
                p_nome: values.nome_item?.trim(),
                p_preco: Number(values.preco),
                p_ativo: Boolean(values.ativo)
            };

            await dataProvider.update("item_pdv", {
                id: values.id,
                previousData: values,
                meta: { rpc: "upsert_item_pdv" },
                data: payload
            });

            notify("Item atualizado com sucesso");
            redirect("edit", "pontos_de_venda", values.pdv_id);

        } catch (error: any) {
            notify(error.message, { type: "error" });
        }
    };

    return (
        <Edit actions={<ItemPdvAction />}>
            <SimpleForm onSubmit={handleSubmit}>
                <ItemPdvForm />
            </SimpleForm>
        </Edit>
    );
};

const ItemPdvForm = ({ context }: any) => {
    const record = useRecordContext();

    const isEdit = !!record;

    // IDs vindos de:
    // - edit → record
    // - create → context
    const pdvId = record?.pdv_id ?? context?.pdv_id;
    const eventoId = context?.evento_id;

    // busca nome do item somente no edit
    const { data: item } = useGetOne(
        "itens",
        { id: record?.item_id },
        { enabled: isEdit }
    );

    const { data: pdv } = useGetOne("pontos_de_venda", { id: pdvId });
    const { data: evento } = useGetOne("eventos", { id: eventoId ?? pdv?.evento_id });

    if (!pdv || !evento) return null;

    return (
        <Box maxWidth={500}>
            {/* HEADER */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6">{pdv.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Evento: {evento.nome}
                    </Typography>
                </CardContent>
            </Card>

            {/* CAMPOS */}
            <TextInput
                source="nome_item"
                label="Nome do item"
                defaultValue={item?.nome}
                validate={required()}
                fullWidth
                autoFocus={!isEdit}
            />

            <CurrencyInput
                source="preco"
                label="Preço no PDV"
                validate={required()}
            />

            <BooleanInput sx={{ mt: 2 }} source="ativo" label="Ativo" />
        </Box>
    );
};
