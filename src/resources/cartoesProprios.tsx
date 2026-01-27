// resources/cartoesProprios.tsx
import {
  ListBase,
  Datagrid,
  TextField,
  NumberField,
  TopToolbar,
  Button,
  useRecordContext,
  useNotify,
  useRefresh,
  useDataProvider,
  DateField,
  Pagination,
  NumberInput,
  SimpleForm,
  TextInput,
  ReferenceManyField,
  Show,
  SimpleShowLayout,
  ChipField,
  Confirm,
} from 'react-admin';
import { VincularCartaoModal } from './vincularCartaoModal';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Chip, Stack, Card, CardContent, Typography } from '@mui/material';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BlockIcon from '@mui/icons-material/Block';

import { DesvincularCartoesLoteModal } from './desvincularCartoesLoteModal';
import { ExportarCartoesPdf } from './exportarCartoesPdf';
import { BackToListButtonNavigate } from '../components/BackToListButton';

const GerarCartoesPropriosButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Gerar cartões"
        onClick={() => setOpen(true)}
      />

      {open && <GerarCartoesPropriosDialog onClose={() => setOpen(false)} />}
    </>
  );
};

const GerarCartoesPropriosDialog = ({ onClose }: { onClose: () => void }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleSubmit = async (values: any) => {
    try {
      await dataProvider.create('gerar-cartoes-proprios', {
        data: values,
      });

      notify('Cartões próprios gerados com sucesso', { type: 'success' });
      refresh();
      onClose();
    } catch (e: any) {
      notify(e?.message ?? 'Erro ao gerar cartões', { type: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerar cartões próprios</DialogTitle>

      <DialogContent>
        <SimpleForm onSubmit={handleSubmit}>
          <TextInput source="prefixo" label="Prefixo" required />
          <NumberInput source="inicio" label="Sequência inicial" required />
          <NumberInput source="fim" label="Sequência final" required />
        </SimpleForm>
      </DialogContent>
    </Dialog>
  );
};

const DesvincularEventoButton = ({
  onOpen,
}: {
  onOpen: (cartao: any) => void;
}) => {
  const record = useRecordContext();

  if (!record) return null;
  if (!record.evento_id) return null;

  return (
    <Button
      label="Desvincular"
      color="error"
      startIcon={<LinkOffIcon />}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(record);
      }}
    />
  );
};


export const StatusCartaoProprioField = () => {
  const record = useRecordContext();

  if (!record) return null;
  switch (record.status_cartao) {
    case 'disponivel':
      return <Chip label="Disponível" color="success" />;

    case 'vinculado':
      return <Chip label="Vinculado" color="info" />;

    case 'bloqueado':
      return <Chip label="Bloqueado" color="warning" />;

    case 'cancelado':
      return <Chip label="Cancelado" color="error" />;

    default:
      return null;
  }
};

export const CartoesPropriosList = () => {
  const [cartaoSelecionado, setCartaoSelecionado] =
    useState<any | null>(null);

  const [acao, setAcao] = useState<'vincular' | 'desvincular' | null>(
    null
  );

  return (
    <>
      <ListBase resource="vw_cartoes_proprios" perPage={25}>
        <TopToolbar>
          <GerarCartoesPropriosButton />
          <ExportarCartoesPropriosButton />
        </TopToolbar>

        <Datagrid rowClick="show">
          <StatusCartaoProprioField />
          <TextField source="codigo_unico" />
          <TextField source="evento_nome" />
          <NumberField source="saldo" />
          <DateField source="criado_em" showTime />

          <VincularEventoButton
            onOpen={(cartao) => {
              setCartaoSelecionado(cartao);
              setAcao('vincular');
            }}
          />

          <DesvincularEventoButton
            onOpen={(cartao) => {
              setCartaoSelecionado(cartao);
              setAcao('desvincular');
            }}
          />

            <CancelarCartaoProprioButton />
        </Datagrid>

        <Pagination />
      </ListBase>

      {/* ========================= */}
      {/* MODAIS FORA DO DATAGRID */}
      {/* ========================= */}

      {acao === 'vincular' && cartaoSelecionado && (
        <VincularCartaoModal
          open
          cartao={cartaoSelecionado}
          onClose={() => {
            setCartaoSelecionado(null);
            setAcao(null);
          }}
        />
      )}

      {acao === 'desvincular' && cartaoSelecionado && (
        <DesvincularCartoesLoteModal
          open
          cartao={cartaoSelecionado}
          onClose={() => {
            setCartaoSelecionado(null);
            setAcao(null);
          }}
        />
      )}
    </>
  );
};

const ExportarCartoesPropriosButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Exportar cartões próprios"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => setOpen(true)}
      />

      {open && (
        <ExportarCartoesPdf
          tipo="proprio"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};



const VincularEventoButton = ({ onOpen }: { onOpen: (cartao: any) => void }) => {
  const record = useRecordContext();

  if (!record || record.evento_id) return null;

  return (
    <Button
      label="Vincular"
      onClick={(e) => {
        e.stopPropagation();
        onOpen(record);
      }}
    />
  );
};

const CartaoProprioShowActions = () => (
  <TopToolbar>
    <BackToListButtonNavigate />
    <CancelarCartaoProprioButton />
  </TopToolbar>
);

export const CartaoProprioShow = () => (
  <Show actions={<CartaoProprioShowActions />}>
    <SimpleShowLayout>

      {/* ========================= */}
      {/* DADOS DO CARTÃO */}
      {/* ========================= */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dados do cartão
          </Typography>

          <Stack spacing={1}>
            <TextField source="codigo_unico" label="Código" />
            <NumberField source="saldo" />
            <TextField source="status_cartao" label="Status" />
            <DateField source="criado_em" showTime />
          </Stack>
        </CardContent>
      </Card>

      {/* ========================= */}
      {/* HISTÓRICO */}
      {/* ========================= */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Histórico de participação em eventos
          </Typography>

          <ReferenceManyField
            reference="vw_cartao_proprio_historico"
            target="cartao_id"
            sort={{ field: 'data_entrada', order: 'DESC' }}
          >
            <Datagrid bulkActionButtons={false}>
              <TextField source="evento_nome" label="Evento" />
              <ChipField source="status" />
              <DateField source="data_entrada" label="Entrada" />
              <DateField source="data_saida" label="Saída" />
            </Datagrid>
          </ReferenceManyField>
        </CardContent>
      </Card>

    </SimpleShowLayout>
  </Show>
);

export const CancelarCartaoProprioButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const [open, setOpen] = useState(false);

  if (!record) return null;
  if (record.status === 'cancelado') return null;

  const handleConfirm = async () => {
    setOpen(false);

    await dataProvider.update('meios_acesso', {
      id: record.id,
      data: { status: 'cancelado' },
      previousData: record,
    });

    notify('Cartão cancelado com sucesso', { type: 'success' });
    refresh();
  };

  return (
    <>
      <Button
        label="Cancelar cartão"
        color="error"
        startIcon={<BlockIcon />}
        onClick={() => setOpen(true)}
      />

      <Confirm
        isOpen={open}
        title="Cancelar cartão"
        content="Tem certeza que deseja cancelar este cartão? Essa ação não poderá ser desfeita."
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
