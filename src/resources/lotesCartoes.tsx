import { useMediaQuery } from '@mui/material';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    SimpleList,
    ReferenceField,
    NumberInput,
    SimpleForm,
    Create,
    required,
    TextInput,
    Edit,
    TopToolbar,
    ListBase,
    Button,
    Confirm,
    useDataProvider,
    useNotify,
    useRecordContext,
    useRefresh,
    Pagination,
    CreateButton,
    Identifier,
} from 'react-admin';
import { BackToListButton } from '../components/BackToListButton';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { CartoesDoLoteButton } from './cartoes';
import { supabase } from '../lib/supabaseClient';
import { ExportarCartoesPdf } from './exportarCartoesPdf';


const LoteListActions = () => {
    const { eventoId } = useParams();

    return (
        <TopToolbar>
            <CreateButton
                resource="lotes_cartoes"
                to={`/eventos/${eventoId}/lotes-cartoes/create`}
            />
        </TopToolbar>
    );
};

export const LoteCartaoList = () => {
    const { eventoId } = useParams();

    return (
        <ListBase
            resource="lotes_cartoes"
            filter={{ evento_id: eventoId }}
            perPage={25}
        >
            <LoteListActions />

            <Datagrid rowClick="edit">
                <ReferenceField source="evento_id" reference="eventos">
                    <TextField source="nome" />
                </ReferenceField>

                <TextField source="prefixo_codigo" />
                <NumberField source="sequencial_inicio" />
                <NumberField source="sequencial_fim" />
                <NumberField source="quantidade" />
                <DateField source="criado_em" showTime />
            </Datagrid>

            <Pagination />
        </ListBase>
    );
};

export const GerarCartoesButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!record) return null;

    const handleConfirm = async () => {
        setOpen(false);
        setLoading(true);

        try {
            await dataProvider.create('lotes_cartoes_gerar', {
                data: {
                    lote_id: record.id,
                },
            });

            notify('Cartões gerados com sucesso', { type: 'success' });
            refresh();
        } catch (error: any) {
            const status = error?.context?.status;

            if (status === 409) {
                notify(
                    'Este lote já teve os cartões gerados.',
                    { type: 'warning' }
                );
            } else {
                notify(
                    'Erro ao gerar cartões.',
                    { type: 'error' }
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                label="Gerar cartões"
                startIcon={<CreditCardIcon />}
                onClick={() => setOpen(true)}
                disabled={loading}
            />

            <Confirm
                isOpen={open}
                title="Gerar cartões"
                content="Tem certeza que deseja gerar os cartões deste lote? Essa ação não poderá ser refeita."
                onConfirm={handleConfirm}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export const LoteCartaoCreate = () => {
    const record = useRecordContext();
    const eventoId = record?.evento_id;
    const navigate = useNavigate();

    return (
        <Create
            resource="lotes_cartoes"
            mutationOptions={{
                onSuccess: () => {
                    navigate(`/eventos/${eventoId}/lotes-cartoes`);
                },
            }}
        >
            <SimpleForm
                defaultValues={{
                    evento_id: eventoId,
                }}
            >
                <TextInput source="evento_id" style={{ display: 'none' }} />

                <TextInput
                    source="prefixo_codigo"
                    label="Prefixo do cartão"
                    validate={required()}
                    fullWidth
                />

                <NumberInput
                    source="sequencial_inicio"
                    validate={required()}
                />

                <NumberInput
                    source="quantidade"
                    validate={required()}
                />
            </SimpleForm>
        </Create>
    );
};

const ExportarPdfButton = () => {
  const record = useRecordContext();
  const [open, setOpen] = useState(false);

  if (!record) return null;

  return (
    <>
      <Button
        label="Exportar PDF"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => setOpen(true)}
      />

      {open && (
        <ExportarCartoesPdf
          loteId={record.id}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

const EditActions = () => (
    <TopToolbar>
        <BackToListButton />
        <GerarCartoesButton />
        <ExportarPdfButton />
        <CartoesDoLoteButton />
    </TopToolbar>
);

export const LoteCartaoEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <TextInput source="prefixo_codigo" disabled fullWidth />

            <NumberInput source="sequencial_inicio" disabled />
            <NumberInput source="sequencial_fim" disabled />
            <NumberInput source="quantidade" disabled />

            <TextInput
                source="arte_frente_url"
                label="Arte frente (URL)"
                fullWidth
            />

            <TextInput
                source="arte_verso_url"
                label="Arte verso (URL)"
                fullWidth
            />

            <DateField source="criado_em" showTime />
        </SimpleForm>
    </Edit>
);

