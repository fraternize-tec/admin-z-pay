import { Button, useNotify, useRefresh, useRecordContext, Create, Datagrid, DateField, Edit, List, ReferenceField, ReferenceInput, required, SelectInput, SimpleForm, TextField, TextInput, TopToolbar, SaveButton, Toolbar, Tab, ReferenceManyField, Show, TabbedShowLayout, usePermissions } from 'react-admin';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { supabase } from '../lib/supabaseClient';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UsuariosDatagrid } from '../components/UsuariosDatagrid';
import { getEscopos, isGlobal } from '../utils/permissionUtils';
import { useEffect } from 'react';
import { can } from '../auth/useCan';

export const AbrirCaixaButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record || record.status === 'aberto') return null;

    const handleClick = async () => {
        const { error } = await supabase.rpc('abrir_caixa', {
            p_caixa_id: record.id,
        });

        if (error) notify(error.message, { type: 'error' });
        else {
            notify('Caixa aberto com sucesso');
            refresh();
        }
    };

    return (
        <Button label="Abrir" onClick={handleClick}>
            <PlayArrowIcon />
        </Button>
    );
};

export const FecharCaixaButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record || record.status === 'fechado') return null;

    const handleClick = async () => {
        const { error } = await supabase.rpc('fechar_caixa', {
            p_caixa_id: record.id,
        });

        if (error) notify(error.message, { type: 'error' });
        else {
            notify('Caixa fechado com sucesso');
            refresh();
        }
    };

    return (
        <Button label="Fechar" onClick={handleClick}>
            <StopIcon />
        </Button>
    );
};

export const CaixaList = () => {

    const { permissions, isLoading } = usePermissions();
    const navigate = useNavigate();

    if (isLoading) return null;

    const caixasPermitidos = getEscopos(
        permissions,
        "listar.caixa",
        "caixa"
    ) || [];

    const eventosPermitidos = getEscopos(
        permissions,
        "listar.caixa",
        "evento"
    ) || [];

    useEffect(() => {
        if (caixasPermitidos?.length === 1 && eventosPermitidos.length === 0) {
            navigate(`/caixas/${caixasPermitidos[0]}`);
        }
    }, [caixasPermitidos, eventosPermitidos]);

    if (!can(permissions, "listar.caixa")) {
        return null;
    }

    return (
        <List
            queryOptions={
                !isGlobal(permissions, "listar.caixa")
                    ? {
                        meta: {
                            or: [
                                caixasPermitidos?.length
                                    ? `id.in.(${caixasPermitidos.join(',')})`
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
            <Datagrid>

                <TextField source="nome" label="Caixa" />

                <ReferenceField source="evento_id" reference="eventos" label="Evento">
                    <TextField source="nome" />
                </ReferenceField>

                <ReferenceField source="pdv_id" reference="pontos_de_venda" label="PDV">
                    <TextField source="nome" />
                </ReferenceField>

                <TextField source="status" label="Status" />
                <DateField source="aberto_em" label="Aberto em" />
                <DateField source="fechado_em" label="Fechado em" />

                <AbrirCaixaButton />
                <FecharCaixaButton />

            </Datagrid>
        </List>
    );
};

export const CaixaCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput
                source="nome"
                label="Nome do Caixa"
                validate={required()}
            />

            <ReferenceInput source="evento_id" reference="eventos">
                <SelectInput optionText="nome" label="Evento" validate={required()} />
            </ReferenceInput>

            <ReferenceInput source="pdv_id" reference="pontos_de_venda">
                <SelectInput optionText="nome" label="PDV" />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);

const CriarUsuarioCaixaButton = () => {
    const record = useRecordContext();
    const navigate = useNavigate();

    if (!record) return null;

    const handleClick = () => {
        navigate(`/usuarios/create?caixa_id=${record.id}`);
    };

    return (
        <Button
            label="Adicionar Operador"
            startIcon={<PersonAddIcon />}
            onClick={handleClick}
        />
    );
};

const CaixaActions = () => {
    return (
        <TopToolbar>
            <CriarUsuarioCaixaButton />
            <BackToListButtonNavigate />
        </TopToolbar>
    );
};

const CaixaEditToolbar = () => (
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Esquerda */}
        <SaveButton />

        {/* Direita */}
        <Box sx={{ display: 'flex', gap: 1 }}>
            <AbrirCaixaButton />
            <FecharCaixaButton />
        </Box>
    </Toolbar>
);

export const CaixaEdit = () => (
    <Edit actions={<CaixaActions />}>
        <SimpleForm toolbar={<CaixaEditToolbar />}>
            {/* Único campo editável */}
            <TextInput
                source="nome"
                label="Nome do Caixa"
                validate={required()}
                fullWidth
            />

            {/* Evento (somente leitura) */}
            <ReferenceInput source="evento_id" reference="eventos">
                <SelectInput
                    optionText="nome"
                    label="Evento"
                    disabled
                    fullWidth
                />
            </ReferenceInput>

            {/* PDV (somente leitura) */}
            <ReferenceInput source="pdv_id" reference="pontos_de_venda">
                <SelectInput
                    optionText="nome"
                    label="PDV"
                    disabled
                    fullWidth
                />
            </ReferenceInput>

            {/* Campos financeiros read-only */}
            <TextInput source="status" label="Status" disabled fullWidth />
            <TextInput source="aberto_em" label="Aberto em" disabled fullWidth />
            <TextInput source="fechado_em" label="Fechado em" disabled fullWidth />
        </SimpleForm>
        <Show actions={false}>
            <TabbedShowLayout>
                <Tab label="Operadores">
                    <UsuariosDoCaixaTab />
                </Tab>
            </TabbedShowLayout>
        </Show>

    </Edit>
);

const UsuariosDoCaixaTab = () => {

    const record = useRecordContext();

    if (!record) return null;

    return (
        <ReferenceManyField
            reference="usuarios_por_escopo"
            target="caixa_id"
        >
            <UsuariosDatagrid rowClick={false} disableBulkDelete={true} />

        </ReferenceManyField>
    );
};


