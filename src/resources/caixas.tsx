import {
    useNotify,
    useRefresh,
    useRecordContext,
    Create,
    Datagrid,
    DateField,
    Edit,
    List,
    ReferenceField,
    required,
    SimpleForm,
    TextField,
    TextInput,
    Toolbar,
    ReferenceManyField,
    usePermissions,
    TabbedForm,
    FormTab,
    SaveButton,
    CreateButton,
    FilterLiveSearch,
    RecordContextProvider,
    WithListContext
} from 'react-admin';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { supabase } from '../lib/supabaseClient';
import { Box, Button } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UsuariosDatagrid } from '../components/UsuariosDatagrid';
import { getEscopos, isGlobal } from '../utils/permissionUtils';
import { useEffect } from 'react';
import { can } from '../auth/useCan';
import { EventoReferenceInput } from '../components/EventoReferenceInput';
import { SmartToolbar } from '../components/SmartToolbar';
import { ReenviarConviteButton, ToggleUsuarioButton } from './usuarios';
import { InfoReferenceField } from '../components/InfoReferenceField';
import { InfoTextField } from '../components/InfoTextField';

const mobileButtonSx = {
    minWidth: 0,
    flexGrow: 1,
    flexBasis: {
        xs: '48%',
        sm: 'auto'
    },
    whiteSpace: 'nowrap'
};

export const AbrirCaixaButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record || record.status === 'aberto') return null;

    const handleClick = async () => {
        const { error } = await supabase.rpc(
            'abrir_caixa',
            { p_caixa_id: record.id }
        );

        if (error) notify(error.message, { type: 'error' });
        else {
            notify('Caixa aberto com sucesso');
            refresh();
        }
    };

    return (
        <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleClick}
            sx={mobileButtonSx}
        >
            Abrir
        </Button>
    );
};

export const FecharCaixaButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record || record.status === 'fechado') return null;

    const handleClick = async () => {
        const { error } = await supabase.rpc(
            'fechar_caixa',
            { p_caixa_id: record.id }
        );

        if (error) notify(error.message, { type: 'error' });
        else {
            notify('Caixa fechado com sucesso');
            refresh();
        }
    };

    return (
        <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleClick}
            sx={mobileButtonSx}
        >
            Fechar
        </Button>
    );
};

const CaixaListActions = ({
    isSmall
}: {
    isSmall: boolean
}) => (
    <SmartToolbar>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',

                flexGrow: isSmall ? 1 : 0,
                mr: isSmall ? 0 : 'auto',
                mt: isSmall ? 0 : 1.5,
                width: {
                    xs: '100%',
                    sm: 280
                }
            }}
        >
            <FilterLiveSearch
                source="nome"
                label=""
                placeholder="Buscar caixa"
                sx={{
                    width: '100%'
                }}
            />
        </Box>

        <CreateButton />
    </SmartToolbar>
);

export const CaixaList = () => {
    const { permissions, isLoading } = usePermissions();
    const navigate = useNavigate();

    const theme = useTheme();
    const isSmall = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    if (isLoading) return null;

    const caixasPermitidos =
        getEscopos(permissions, "listar.caixa", "caixa") || [];

    const eventosPermitidos =
        getEscopos(permissions, "listar.caixa", "evento") || [];

    useEffect(() => {
        if (
            caixasPermitidos?.length === 1 &&
            eventosPermitidos.length === 0
        ) {
            navigate(`/caixas/${caixasPermitidos[0]}`);
        }
    }, [caixasPermitidos, eventosPermitidos]);

    if (!can(permissions, "listar.caixa")) {
        return null;
    }

    return (
        <List
            actions={<CaixaListActions isSmall={isSmall} />}
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
            {isSmall ? (
                <WithListContext
                    render={({ data }) => (
                        <Box>
                            {data?.map((item) => (
                                <Box
                                    key={item.id}
                                    onClick={() =>
                                        navigate(`/caixas/${item.id}`)
                                    }
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        cursor: 'pointer',

                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                >
                                    <Box fontWeight={700}>
                                        {item.nome}
                                    </Box>

                                    <Box color="text.secondary">
                                        Status: {item.status}
                                    </Box>

                                    {item.aberto_em && (
                                        <Box color="text.secondary">
                                            Aberto em: {new Date(
                                                item.aberto_em
                                            ).toLocaleDateString('pt-BR')}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )}
                />
            ) : (

                <Datagrid>
                    <TextField source="nome" label="Caixa" />

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
                    <DateField
                        source="aberto_em"
                        label="Aberto em"
                    />
                    <DateField
                        source="fechado_em"
                        label="Fechado em"
                    />

                    <AbrirCaixaButton />
                    <FecharCaixaButton />
                </Datagrid>
            )}
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

            <EventoReferenceInput
                permissao="listar.caixa"
                resource="caixas"
            />
        </SimpleForm>
    </Create>
);

const CriarUsuarioCaixaButton = () => {
    const record = useRecordContext();
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmall = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    if (!record) return null;

    return (
        <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() =>
                navigate(`/usuarios/create?caixa_id=${record.id}`)
            }
            sx={mobileButtonSx}
        >
            {isSmall ? 'Operador' : 'Adicionar Operador'}
        </Button>
    );
};

const VoltarButton = () => {
    const navigate = useNavigate();

    return (
        <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={mobileButtonSx}
        >
            Voltar
        </Button>
    );
};

const CaixaActions = () => (
    <SmartToolbar>
        <CriarUsuarioCaixaButton />
        <VoltarButton />
    </SmartToolbar>
);

const CaixaEditToolbar = () => (
    <Toolbar
        sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1
        }}
    >
        <SaveButton sx={mobileButtonSx} />

        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                width: {
                    xs: '100%',
                    sm: 'auto'
                }
            }}
        >
            <AbrirCaixaButton />
            <FecharCaixaButton />
        </Box>
    </Toolbar>
);

export const CaixaEdit = () => (
    <Edit
        actions={<CaixaActions />}

    >
        <TabbedForm
            toolbar={<CaixaEditToolbar />}

        >
            <FormTab label="Dados">
                <TextInput
                    source="nome"
                    label="Nome do Caixa"
                    validate={required()}
                    fullWidth
                />

                <InfoReferenceField
                    label="Evento"
                    source="evento_id"
                    reference="eventos"
                />

                <InfoReferenceField
                    label="PDV"
                    source="pdv_id"
                    reference="pontos_de_venda"
                />

                <InfoTextField
                    label="Status"
                    source="status"
                />

                <InfoTextField
                    label="Aberto em"
                    source="aberto_em"
                />

                <InfoTextField
                    label="Fechado em"
                    source="fechado_em"
                />
            </FormTab>

            <FormTab label="Operadores">
                <UsuariosDoCaixaTab />
            </FormTab>
        </TabbedForm>
    </Edit>
);

const UsuariosDoCaixaTab = () => {
    const record = useRecordContext();

    const theme = useTheme();

    const isSmall = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    if (!record) return null;

    return (
        <ReferenceManyField
            reference="usuarios_por_escopo"
            target="caixa_id"
        >
            {isSmall ? (
                <WithListContext
                    render={({ data }) => (
                        <Box>
                            {data?.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        py: 1.5,
                                        borderBottom: 1,
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box fontWeight={600}>
                                        {user.nome}
                                    </Box>

                                    <Box
                                        fontSize="0.9rem"
                                        color="text.secondary"
                                    >
                                        {user.email} • {user.status ?? 'ativo'}
                                    </Box>

                                    <Box
                                        display="flex"
                                        gap={1}
                                        mt={1}
                                        flexWrap="wrap"
                                    >
                                        <RecordContextProvider value={user}>
                                            <ToggleUsuarioButton />
                                            <ReenviarConviteButton />
                                        </RecordContextProvider>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                />
            ) : (
                <UsuariosDatagrid
                    rowClick={false}
                    disableBulkDelete
                />
            )}
        </ReferenceManyField>
    );
};