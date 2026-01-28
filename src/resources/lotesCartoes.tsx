import {
  Datagrid,
  TextField,
  DateField,
  NumberField,
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
  DeleteButton,
  ImageField,
  ImageInput,
  useGetOne,
} from 'react-admin';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Chip } from '@mui/material';
import { CartoesDoLoteButton } from './cartoes';
import { ExportarCartoesPdf } from './exportarCartoesPdf';
import { supabase } from '../lib/supabaseClient';
import { ExportarCartoesPdfDialog } from './exportarCartoesPdfDialog';
import { BackToListButtonNavigate } from '../components/BackToListButton';


const LoteListActions = () => {
  const { eventoId } = useParams();

  return (
    <TopToolbar>
      <BackToListButtonNavigate />
      <CreateButton
        resource="lotes_cartoes"
        to={`/eventos/${eventoId}/lotes-cartoes/create`}
      />
    </TopToolbar>
  );
};

export const LoteStatusField = () => {
  const record = useRecordContext();

  if (!record) return null;

  switch (record.status_lote) {
    case 'criado':
      return <Chip label="Criado" color="warning" />;

    case 'gerado':
      return <Chip label="Gerado" color="info" />;

    case 'impresso':
      return <Chip label="Impresso" color="success" />;

    default:
      return null;
  }
};

export const LoteCartaoList = () => {
  const { eventoId } = useParams();

  return (
    <ListBase
      resource="vw_lotes_cartoes_status"
      filter={{ evento_id: eventoId }}
      perPage={25}
    >
      <LoteListActions />

      <Datagrid
        rowClick={(id, resource, record) =>
          `/lotes_cartoes/${record.id}`
        }
      >
        <LoteStatusField />
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

export const GerarCartoesButton = ({ record }: ActionProps) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const [open, setOpen] = useState(false);

  if (!record) return null;
  if (record.status_lote !== 'criado') return null;

  const handleConfirm = async () => {
    setOpen(false);

    try {
      await dataProvider.create('lotes_cartoes_gerar', {
        data: { lote_id: record.id },
      });

      notify('Cartões gerados com sucesso', { type: 'success' });
      refresh();
    } catch (error: any) {
      if (error?.context?.status === 409) {
        notify('Este lote já teve os cartões gerados.', {
          type: 'warning',
        });
      } else {
        notify('Erro ao gerar cartões.', { type: 'error' });
      }
    }
  };

  return (
    <>
      <Button
        label="Gerar cartões"
        startIcon={<CreditCardIcon />}
        onClick={() => setOpen(true)}
      />

      <Confirm
        isOpen={open}
        title="Gerar cartões"
        content="Tem certeza que deseja gerar os cartões deste lote?"
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const LoteCartaoCreate = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();

  return (
    <Create
      resource="lotes_cartoes"
      transform={(data) => ({
        ...data,
        evento_id: eventoId,
      })}
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

const ExportarPdfButton = ({ record }: ActionProps) => {
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<'pdf' | 'zip' | null>(null);

  if (!record) return null;
  if (record.status_lote === 'criado') return null;

  return (
    <>
      <Button
        label="Exportar cartões"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => setOpen(true)}
      />

      {open && (
        <ExportarCartoesPdfDialog
          open
          onClose={() => setOpen(false)}
          onConfirm={(m) => {
            setModo(m);
            setOpen(false);
          }}
        />
      )}

      {modo && (
        <ExportarCartoesPdf
          tipo="lote"
          loteId={record.id}
          zip={modo === 'zip'}
          onClose={() => setModo(null)}
        />
      )}
    </>
  );
};

const DeleteLoteButton = ({ record }: ActionProps) => {
  const notify = useNotify();

  if (!record) return null;
  if (record.status_lote !== 'criado') return null;

  if (record.total_cartoes > 0) {
    return (
      <Button
        label="Excluir"
        disabled
        onClick={() =>
          notify(
            'Não é possível excluir um lote com cartões gerados',
            { type: 'warning' }
          )
        }
      />
    );
  }

  return <DeleteButton />;
};

const MarcarImpressoButton = ({ record }: ActionProps) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  if (!record) return null;
  if (record.status_lote !== 'gerado') return null;

  const handleClick = async () => {
    await dataProvider.create('marcar-lote-impresso', {
      data: { lote_id: record.id },
    });

    notify('Lote marcado como impresso', { type: 'success' });
    refresh();
  };

  return (
    <Button
      label="Marcar como impresso"
      onClick={handleClick}
    />
  );
};

const BackToEventoLotesButton = ({ record }: ActionProps) => {
  const navigate = useNavigate();

  if (!record?.evento_id) return null;

  return (
    <Button
      label="Voltar"
      startIcon={<ArrowBackIcon />}
      onClick={() =>
        navigate(`/eventos/${record.evento_id}/lotes-cartoes`)
      }
    />
  );
};

const PreviewArte = ({ source, label }: { source: string; label: string }) => {
  const record = useRecordContext();

  if (!record?.[source]) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <strong>{label}</strong>
      <div>
        <img
          src={record[source]}
          style={{
            maxWidth: 320,
            borderRadius: 8,
            border: '1px solid #ddd',
            marginTop: 6,
          }}
        />
      </div>
    </div>
  );
};

const EditActions = () => {
  const record = useRecordContext();

  const { data: view } = useGetOne(
    'vw_lotes_cartoes_status',
    { id: record?.id },
    { enabled: !!record?.id }
  );

  if (!record || !view) return null;

  return (
    <TopToolbar>
      <BackToEventoLotesButton record={view} />

      {view.status_lote === 'criado' && (
        <GerarCartoesButton record={view} />
      )}

      {view.status_lote === 'gerado' && (
        <MarcarImpressoButton record={view} />
      )}

      {view.status_lote !== 'criado' && (
        <ExportarPdfButton record={view} />
      )}

      {view.total_cartoes > 0 && (
        <CartoesDoLoteButton record={view} />
      )}

      {view.status_lote === 'criado' && (
        <DeleteLoteButton record={view} />
      )}
    </TopToolbar>
  );
};

interface ActionProps {
  record?: any;
}

export const LoteCartaoEdit = () => {
  return (
    <Edit
      resource="lotes_cartoes"
      actions={<EditActions />}
      mutationMode="pessimistic"
      redirect={false}
      transform={async (data) => {
        const updates: any = {};

        const upload = async (file: any, nome: string) => {
          const path = `eventos/${data.evento_id}/lotes/${data.id}/${nome}.png`;

          const { error } = await supabase.storage
            .from('cartoes-artes')
            .upload(path, file.rawFile, {
              upsert: true,
              contentType: file.rawFile.type,
              cacheControl: 'no-cache',
            });

          if (error) throw error;

          const { data: url } = supabase.storage
            .from('cartoes-artes')
            .getPublicUrl(path);

          return `${url.publicUrl}?v=${Date.now()}`;
        };


        if (data.arte_frente_file) {
          updates.arte_frente_url = await upload(
            data.arte_frente_file,
            'frente'
          );
        }

        if (data.arte_verso_file) {
          updates.arte_verso_url = await upload(
            data.arte_verso_file,
            'verso'
          );
        }

        return updates;
      }}
    >
      <SimpleForm>
        <TextInput source="prefixo_codigo" disabled fullWidth />
        <NumberInput source="sequencial_inicio" disabled />
        <NumberInput source="sequencial_fim" disabled />
        <NumberInput source="quantidade" disabled />

        <ImageInput source="arte_frente_file" label="Arte frente">
          <ImageField source="src" />
        </ImageInput>

        <PreviewArte
          source="arte_frente_url"
          label="Arte frente atual"
        />

        <ImageInput source="arte_verso_file" label="Arte verso">
          <ImageField source="src" />
        </ImageInput>

        <PreviewArte
          source="arte_verso_url"
          label="Arte verso atual"
        />
      </SimpleForm>
    </Edit>
  );
};

