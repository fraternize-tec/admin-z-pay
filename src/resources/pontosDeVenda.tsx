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
} from 'react-admin';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { ItensDoPdv } from './itemPdv';
import AddIcon from '@mui/icons-material/Add';

/* ================= LIST ================= */
export const PontoDeVendaList = () => (
    <List>
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
);

/* ================= CREATE ================= */
export const PontoDeVendaCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="nome" label="Nome" fullWidth validate={required()} />
            <TextInput source="localizacao" label="Localização" fullWidth />

            <ReferenceInput source="evento_id" reference="eventos">
                <SelectInput optionText="nome" label="Evento" validate={required()} />
            </ReferenceInput>

            <BooleanInput source="ativo" label="Ativo" defaultValue />
        </SimpleForm>
    </Create>
);

/* ================= ACTIONS EDIT ================= */

const PontoDeVendaActions = () => (
    <TopToolbar>
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


/* ================= EDIT ================= */

export const PontoDeVendaEdit = () => (
    <Edit actions={<PontoDeVendaActions />}>
        <>
            {/* ===== FORMULÁRIO BÁSICO ===== */}
            <SimpleForm toolbar={<PontoDeVendaFormToolbar />}>
                <TextInput source="nome" label="Nome" fullWidth />
                <TextInput source="localizacao" label="Localização" fullWidth />

                <ReferenceInput source="evento_id" reference="eventos">
                    <SelectInput optionText="nome" label="Evento" />
                </ReferenceInput>

                <BooleanInput source="ativo" label="Ativo" />
            </SimpleForm>

            {/* ===== TABS DE CONTEXTO ===== */}
            <Show actions={false}>
                <TabbedShowLayout>
                    <Tab label="Cardápio do PDV">
                        <PdvItensTab />
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
