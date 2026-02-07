import { Button, useNotify, useRefresh, useRecordContext, Create, Datagrid, DateField, Edit, List, ReferenceField, ReferenceInput, required, SelectInput, SimpleForm, TextField, TextInput, TopToolbar, SaveButton, Toolbar } from 'react-admin';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { supabase } from '../lib/supabaseClient';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { Box } from '@mui/material';

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

export const CaixaList = () => (
    <List>
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

const CaixaActions = () => {
    return (
        <TopToolbar>
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
    </Edit>
);


