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
    TopToolbar,
    Button,
    useRecordContext,
    useRedirect,
    SaveButton,
    Toolbar,
    Show,
    Tab,
    TabbedShowLayout,
    ReferenceManyField,
    usePermissions,
    useGetList,
} from 'react-admin';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { ItensDoPdv } from './itemPdv';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from 'react-router-dom';
import { UsuariosDatagrid } from '../components/UsuariosDatagrid';
import { getEscopos, isGlobal } from '../utils/permissionUtils';
import { useEffect } from 'react';
import { can } from '../auth/useCan';
import { useFormContext } from "react-hook-form";


/* ================= LIST ================= */
export const PontoDeVendaList = () => {
    const { permissions, isLoading } = usePermissions();
    const navigate = useNavigate();

    if (isLoading) return null;

    const pdvsPermitidos = getEscopos(
        permissions,
        "listar.pdv",
        "pdv"
    ) || [];

    const eventosPermitidos = getEscopos(
        permissions,
        "listar.pdv",
        "evento"
    ) || [];

    useEffect(() => {
        if (pdvsPermitidos?.length === 1 && eventosPermitidos.length === 0) {
            navigate(`/pontos_de_venda/${pdvsPermitidos[0]}`);
        }
    }, [pdvsPermitidos, eventosPermitidos]);

    if (!can(permissions, "listar.pdv")) {
        return null;
    }

    return (
        <List
            queryOptions={
                !isGlobal(permissions, "listar.pdv")
                    ? {
                        meta: {
                            or: [
                                pdvsPermitidos?.length
                                    ? `id.in.(${pdvsPermitidos.join(',')})`
                                    : null,
                                eventosPermitidos?.length
                                    ? `evento_id.in.(${eventosPermitidos.join(',')})`
                                    : null
                            ]
                                .filter(Boolean)
                                .join(',')
                        }
                    }
                    : undefined
            }
        >
            <Datagrid rowClick="edit">
                <TextField source="nome" label="Nome" />
                <TextField source="localizacao" label="Localização" />

                <ReferenceField source="evento_id" reference="eventos" label="Evento">
                    <TextField source="nome" />
                </ReferenceField>

                <BooleanField source="ativo" label="Ativo" />
                <DateField source="criado_em" label="Criado em" />
            </Datagrid>
        </List>
    )
};

const EventoReferenceInput = ({ disabled = false }: any) => {

    const { permissions, isLoading } = usePermissions();
    const { setValue, getValues } = useFormContext();

    const pdvsPermitidos = getEscopos(
        permissions,
        "listar.pdv",
        "pdv"
    ) || [];

    const eventosPermitidos = getEscopos(
        permissions,
        "listar.pdv",
        "evento"
    ) || [];

    const { data: pdvs } = useGetList(
        "pontos_de_venda",
        {
            filter: { id: pdvsPermitidos },
            pagination: { page: 1, perPage: 100 }
        },
        {
            enabled: pdvsPermitidos.length > 0
        }
    );

    const eventosFromPdv =
        pdvs?.map(p => p.evento_id) ?? [];

    const eventosFinal = [
        ...new Set([
            ...eventosPermitidos,
            ...eventosFromPdv
        ])
    ];

    const global = isGlobal(permissions, "listar.pdv");

    // Auto select quando só tiver 1
    useEffect(() => {
        if (!global && eventosFinal.length === 1) {
            const current = getValues("evento_id");

            if (!current) {
                setValue("evento_id", eventosFinal[0], {
                    shouldDirty: true
                });
            }
        }
    }, [eventosFinal, global]);

    if (isLoading) return null;

    return (
        <ReferenceInput
            source="evento_id"
            reference="eventos"
            filter={!global ? { id: eventosFinal } : undefined}
        >
            <SelectInput
                optionText="nome"
                label="Evento"
                disabled={disabled}
                InputProps={
                    !global && eventosFinal.length === 1
                        ? { readOnly: true }
                        : undefined
                }
            />
        </ReferenceInput>
    );
};

/* ================= CREATE ================= */
export const PontoDeVendaCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="nome" label="Nome" fullWidth validate={required()} />
            <TextInput source="localizacao" label="Localização" fullWidth />

            <EventoReferenceInput />

            <BooleanInput source="ativo" label="Ativo" defaultValue />
        </SimpleForm>
    </Create>
);

/* ================= ACTIONS EDIT ================= */

const PontoDeVendaActions = () => (
    <TopToolbar>
        <CriarUsuarioPdvButton />
        <BackToListButtonNavigate />
    </TopToolbar>
);

const PontoDeVendaFormToolbar = () => (
    <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SaveButton />
    </Toolbar>
);

const PdvItensTab = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <>
            <AddItemToPdvButton />

            <ItensDoPdv />
        </>
    );
};

const CriarUsuarioPdvButton = () => {
    const record = useRecordContext();
    const navigate = useNavigate();

    if (!record) return null;

    const handleClick = () => {
        navigate(`/usuarios/create?pdv_id=${record.id}`);
    };

    return (
        <Button
            label="Adicionar Operador"
            startIcon={<PersonAddIcon />}
            onClick={handleClick}
        />
    );
};

const UsuariosDoPdvTab = () => {

    const record = useRecordContext();

    if (!record) return null;

    return (
        <ReferenceManyField
            reference="usuarios_por_escopo"
            target="pdv_id"
        >
            <UsuariosDatagrid rowClick={false} disableBulkDelete={true} />

        </ReferenceManyField>
    );
};

/* ================= EDIT ================= */

export const PontoDeVendaEdit = () => (
    <Edit actions={<PontoDeVendaActions />}>
        <>
            {/* ===== FORMULÁRIO BÁSICO ===== */}
            <SimpleForm toolbar={<PontoDeVendaFormToolbar />}>
                <TextInput source="nome" label="Nome" fullWidth />
                <TextInput source="localizacao" label="Localização" fullWidth />

                <EventoReferenceInput disabled />

                <BooleanInput source="ativo" label="Ativo" />
            </SimpleForm>

            {/* ===== TABS DE CONTEXTO ===== */}
            <Show actions={false}>
                <TabbedShowLayout>
                    <Tab label="Cardápio">
                        <PdvItensTab />
                    </Tab>

                    <Tab label="Operadores">
                        <UsuariosDoPdvTab />
                    </Tab>

                    {/* Futuro crescimento natural */}
                    {/*
                    <Tab label="Caixas do PDV">
                        <CaixasDoPdv />
                    </Tab>
                    */}
                </TabbedShowLayout>
            </Show>
        </>
    </Edit>
);

/* ================= BOTÃO ADICIONAR ITEM ================= */
export const AddItemToPdvButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();

    if (!record) return null;

    const handleClick = () => {
        redirect(
            `/item_pdv/create?source=${encodeURIComponent(
                JSON.stringify({
                    pdv_id: record.id,
                    evento_id: record.evento_id,
                })
            )}`
        );
    };

    return (
        <Button label="Adicionar item" onClick={handleClick}>
            <AddIcon />
        </Button>
    );
};
