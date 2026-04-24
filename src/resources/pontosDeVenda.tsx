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
    required,
    ReferenceField,
    useRecordContext,
    useRedirect,
    SaveButton,
    Toolbar,
    ReferenceManyField,
    usePermissions,
    TabbedForm,
    FormTab,
    CreateButton,
    FilterLiveSearch,
    WithListContext,
    RecordContextProvider
} from 'react-admin';

import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Box, Button } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { UsuariosDatagrid } from '../components/UsuariosDatagrid';
import { getEscopos, isGlobal } from '../utils/permissionUtils';
import { can } from '../auth/useCan';
import { EventoReferenceInput } from '../components/EventoReferenceInput';
import { SmartToolbar } from '../components/SmartToolbar';
import { InfoReferenceField } from '../components/InfoReferenceField';
import { InfoTextField } from '../components/InfoTextField';
import { ItensDoPdv } from './itemPdv';
import { ReenviarConviteButton, ToggleUsuarioButton } from './usuarios';

const mobileButtonSx = {
    minWidth: 0,
    flexGrow: 1,
    flexBasis: {
        xs: '48%',
        sm: 'auto'
    },
    whiteSpace: 'nowrap'
};

/* ================= LIST ACTIONS ================= */

const PdvListActions = ({
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
                placeholder="Buscar PDV"
                sx={{ width: '100%' }}
            />
        </Box>

        <CreateButton />
    </SmartToolbar>
);

/* ================= LIST ================= */

export const PontoDeVendaList = () => {
    const { permissions, isLoading } = usePermissions();
    const navigate = useNavigate();

    const theme = useTheme();

    const isSmall = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    if (isLoading) return null;

    const pdvsPermitidos =
        getEscopos(permissions, "listar.pdv", "pdv") || [];

    const eventosPermitidos =
        getEscopos(permissions, "listar.pdv", "evento") || [];

    useEffect(() => {
        if (
            pdvsPermitidos?.length === 1 &&
            eventosPermitidos.length === 0
        ) {
            navigate(`/pontos_de_venda/${pdvsPermitidos[0]}`);
        }
    }, [pdvsPermitidos, eventosPermitidos]);

    if (!can(permissions, "listar.pdv")) {
        return null;
    }

    return (
        <List
            actions={<PdvListActions isSmall={isSmall} />}
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
            {isSmall ? (
                <WithListContext
                    render={({ data }) => (
                        <Box>
                            {data?.map((item) => (
                                <Box
                                    key={item.id}
                                    onClick={() =>
                                        navigate(
                                            `/pontos_de_venda/${item.id}`
                                        )
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

                                    {item.localizacao && (
                                        <Box color="text.secondary">
                                            {item.localizacao}
                                        </Box>
                                    )}

                                    <Box color="text.secondary">
                                        {item.ativo
                                            ? 'Ativo'
                                            : 'Inativo'}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                />
            ) : (
                <Datagrid rowClick="edit">
                    <TextField source="nome" label="Nome" />

                    <TextField
                        source="localizacao"
                        label="Localização"
                    />

                    <ReferenceField
                        source="evento_id"
                        reference="eventos"
                        label="Evento"
                    >
                        <TextField source="nome" />
                    </ReferenceField>

                    <BooleanField
                        source="ativo"
                        label="Ativo"
                    />

                    <DateField
                        source="criado_em"
                        label="Criado em"
                    />
                </Datagrid>
            )}
        </List>
    );
};

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

            <EventoReferenceInput
                permissao="listar.pdv"
                resource="pontos_de_venda"
            />

            <BooleanInput
                source="ativo"
                label="Ativo"
                defaultValue
            />
        </SimpleForm>
    </Create>
);

/* ================= ACTIONS ================= */

const CriarUsuarioPdvButton = () => {
    const record = useRecordContext();
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmall = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    if (!record) return null;

    return (
        <Button
 variant="contained"            startIcon={<PersonAddIcon />}
            onClick={() =>
                navigate(
                    `/usuarios/create?pdv_id=${record.id}`
                )
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

const PdvActions = () => (
    <SmartToolbar>
        <CriarUsuarioPdvButton />
        <VoltarButton />
    </SmartToolbar>
);

const PdvToolbar = () => (
    <Toolbar
        sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1
        }}
    >
        <SaveButton sx={mobileButtonSx} />
    </Toolbar>
);

/* ================= TABS ================= */

const PdvItensTab = () => (
    <>
        <AddItemToPdvButton />
        <ItensDoPdv />
    </>
);

const UsuariosDoPdvTab = () => {
    const theme = useTheme();

    const isSmall = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    return (
        <ReferenceManyField
            reference="usuarios_por_escopo"
            target="pdv_id"
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
                                        color="text.secondary"
                                        fontSize="0.9rem"
                                    >
                                        {user.email}
                                    </Box>

                                    <Box
                                        display="flex"
                                        gap={1}
                                        mt={1}
                                        flexWrap="wrap"
                                    >
                                        <RecordContextProvider
                                            value={user}
                                        >
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

/* ================= EDIT ================= */

export const PontoDeVendaEdit = () => (
    <Edit actions={<PdvActions />}>
        <TabbedForm toolbar={<PdvToolbar />}>
            <FormTab label="Dados">
                <TextInput
                    source="nome"
                    label="Nome"
                    fullWidth
                />

                <TextInput
                    source="localizacao"
                    label="Localização"
                    fullWidth
                />

                <InfoReferenceField
                    label="Evento"
                    source="evento_id"
                    reference="eventos"
                />

                <InfoTextField
                    label="Ativo"
                    source="ativo"
                />
            </FormTab>

            <FormTab label="Cardápio">
                <PdvItensTab />
            </FormTab>

            <FormTab label="Operadores">
                <UsuariosDoPdvTab />
            </FormTab>
        </TabbedForm>
    </Edit>
);

/* ================= ADD ITEM ================= */

export const AddItemToPdvButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();

    if (!record) return null;

    return (
        <Button
             variant="contained"
             startIcon={<AddIcon />}
            onClick={() =>
                redirect(
                    `/item_pdv/create?source=${encodeURIComponent(
                        JSON.stringify({
                            pdv_id: record.id,
                            evento_id: record.evento_id
                        })
                    )}`
                )
            }
        >
            Adicionar Item 
        </Button>
    );
};