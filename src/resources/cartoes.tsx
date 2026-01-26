import { BooleanField, Button, Confirm, Datagrid, ListBase, NumberField, Pagination, TextField, TopToolbar, useCreate, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, Box, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface PropsEdit {
  record?: any;
}

export const CartoesDoLoteButton = ({ record }: PropsEdit) => {
  const navigate = useNavigate();

  if (!record) return null;

  // só aparece se já existirem cartões
  if (!record.total_cartoes || record.total_cartoes === 0) return null;

  return (
    <Button
      label="Cartões do lote"
      startIcon={<CreditCardIcon />}
      onClick={() =>
        navigate(
          `/eventos/${record.evento_id}/lotes-cartoes/${record.id}/cartoes`
        )
      }
    />
  );
};

const QrButton = ({ onClick }: { onClick: (record: any) => void }) => {
  const record = useRecordContext();

  if (!record) return null;

  return (
    <Button
      label="QR"
      startIcon={<QrCodeIcon />}
      onClick={(e) => {
        e.stopPropagation();
        onClick(record);
      }}
    />
  );
};

const CartaoListActions = () => {
  const navigate = useNavigate();
  const { eventoId } = useParams();

  return (
    <TopToolbar>
      <Button
        label="Voltar"
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          navigate(`/eventos/${eventoId}/lotes-cartoes`)
        }
      />
    </TopToolbar>
  );
};

export const CartaoList = () => {
  const { loteId } = useParams();

  const [selected, setSelected] = useState<any>(null);

  return (
    <>
      <ListBase
        resource="meios_acesso"
        filter={{ lote_id: loteId }}
        perPage={50}
      >
        <CartaoListActions />
        <Datagrid>
          <TextField source="codigo_unico" label="Código" />
          <NumberField source="sequencial_evento" label="Seq." />
          <NumberField source="saldo" />
          <BooleanField source="bloqueado" />
          <TextField source="status" />

          <BloquearButton />
          <ResetarButton />
          <QrButton onClick={setSelected} />
        </Datagrid>

        <Pagination />
      </ListBase>

      {selected && (
        <CartaoQrDialog
          open
          onClose={() => setSelected(null)}
          codigo={selected.codigo_unico}
          nanoId={selected.nano_id}
        />
      )}
    </>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  codigo: string;
  nanoId: string;
}

export const CartaoQrDialog = ({
  open,
  onClose,
  codigo,
  nanoId,
}: Props) => {
  const url = `https://cards.zpay.fraternize.com.br/card/${nanoId}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>QR Code do cartão</DialogTitle>

      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
        >
          <Typography variant="h6">
            {codigo}
          </Typography>

          <QRCodeCanvas value={url} size={220} />

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
          >
            {url}
          </Typography>

          <Button onClick={onClose}>
            Fechar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const BloquearButton = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;

  const handleClick = async () => {
    try {
      await dataProvider.create('bloquear-cartao', {
        data: {
          cartao_id: record.id,
          bloquear: !record.bloqueado,
        },
      });

      notify(
        record.bloqueado
          ? 'Cartão desbloqueado'
          : 'Cartão bloqueado',
        { type: 'success' }
      );

      refresh();
    } catch {
      notify('Erro ao alterar status do cartão', { type: 'error' });
    }
  };

  return (
    <Button
      label={record.bloqueado ? 'Desbloquear' : 'Bloquear'}
      onClick={handleClick}
    />
  );
};

export const ResetarButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const [open, setOpen] = useState(false);
  const [create, { isLoading }] = useCreate();

  if (!record) return null;

  const handleConfirm = () => {
    setOpen(false);

    create(
      'resetar-cartao',
      {
        data: {
          cartao_id: record.id,
        },
      },
      {
        onSuccess: () => {
          notify('Cartão resetado com sucesso', { type: 'success' });
          refresh();
        },
        onError: () => {
          notify('Erro ao resetar cartão', { type: 'error' });
        },
      }
    );
  };

  return (
    <>
      <Button
        label="Resetar"
        color="error"
        startIcon={<RestartAltIcon />}
        onClick={() => setOpen(true)}
        disabled={isLoading}
      />

      <Confirm
        isOpen={open}
        title="Resetar cartão"
        content={
          <>
            <strong>Atenção!</strong>
            <br />
            Esta ação irá:
            <ul>
              <li>Zerar o saldo do cartão</li>
              <li>Remover vínculo com o usuário</li>
              <li>Manter o cartão ativo para novo uso</li>
            </ul>
            Deseja continuar?
          </>
        }
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

