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
  Confirm,
} from 'react-admin';
import { VincularCartaoModal } from './vincularCartaoModal';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Chip, Alert, DialogActions, FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { DesvincularCartoesLoteModal } from './desvincularCartoesLoteModal';
import { ExportarCartoesPdf } from './exportarCartoesPdf';

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

const DesvincularCartaoButton = () => {
  const record = useRecordContext();
  const [open, setOpen] = useState(false);

  if (!record) return null;

  // só aparece se estiver vinculado
  if (!record.evento_id) return null;

  return (
    <>
      <Button
        label="Desvincular"
        startIcon={<LinkOffIcon />}
        color="error"
        onClick={() => setOpen(true)}
      />

      <DesvincularCartoesLoteModal
        open={open}
        onClose={() => setOpen(false)}
        cartao={record}
      />
    </>
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

export const CartoesPropriosList = () => (
  <ListBase resource="vw_cartoes_proprios" perPage={25}>
    <TopToolbar>
      <GerarCartoesPropriosButton />
      <ExportarCartoesPropriosButton />
    </TopToolbar>

    <Datagrid>
      <StatusCartaoProprioField />
      <TextField source="codigo_unico" label="Código" />
      <TextField source="status" />
      <NumberField source="saldo" />
      <DateField source="criado_em" showTime />
      <VincularEventoButton />
      <DesvincularCartaoButton />
    </Datagrid>

    <Pagination />
  </ListBase>
);

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



const VincularEventoButton = () => {
  const record = useRecordContext();
  const [open, setOpen] = useState(false);

  if (!record || record.evento_id) return null;

  return (
    <>
      <Button
        label="Vincular"
        onClick={() => setOpen(true)}
      />

      <VincularCartaoModal
        open={open}
        onClose={() => setOpen(false)}
        cartao={record}
      />
    </>
  );
};

