import { BooleanField, Confirm, Datagrid, ListBase, NumberField, Pagination, TextField, TopToolbar, useCreate, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Button } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { SmartToolbar } from '../components/SmartToolbar';

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
      variant="contained"
      startIcon={<CreditCardIcon />}
      onClick={() =>
        navigate(
          `/eventos/${record.evento_id}/lotes-cartoes/${record.id}/cartoes`
        )
      }
    >
      Cartões do lote
    </Button>
  );
};

const QrButton = ({ onClick }: { onClick: (record: any) => void }) => {
  const record = useRecordContext();

  if (!record) return null;

  return (
    <Button
      startIcon={<QrCodeIcon />}
      onClick={(e) => {
        e.stopPropagation();
        onClick(record);
      }}
    >
      QR
    </Button>
  );
};

const formatarMensagemResultado = (data: any) => {
  const acao = data.operacao === 'reset'
    ? 'resetados'
    : 'limpos';

  const valor = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(data.valor_total_zerado || 0));

  return `${data.total} cartões ${acao}. ` +
    `${data.total_com_saldo} tinham saldo. ` +
    `Total zerado: ${valor}`;
};

const LimparTodosButton = () => {
  const { loteId } = useParams();
  const notify = useNotify();
  const refresh = useRefresh();

  const [open, setOpen] = useState(false);
  const [create, { isLoading }] = useCreate();

  const handleConfirm = () => {
    setOpen(false);

    create(
      'resetar-cartoes-lote',
      {
        data: {
          lote_id: loteId,
          reset_economico: false, // limpeza simples
        },
      },
      {
        onSuccess: (data: any) => {
          notify(formatarMensagemResultado(data), {
            type: 'success',
          });
          refresh();
        },
        onError: () => {
          notify('Erro ao limpar cartões', {
            type: 'error',
          });
        },
      }
    );
  };

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        Limpar todos
      </Button>

      <Confirm
        isOpen={open}
        title="Limpar todos os cartões"
        content={
          <>
            <strong>Atenção!</strong>
            <br />
            Esta ação irá:
            <ul>
              <li>Zerar o saldo de todos os cartões do lote</li>
              <li>Não permitirá cobrar a taxa novamente</li>
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

const ResetarTodosButton = () => {
  const { loteId } = useParams();
  const notify = useNotify();
  const refresh = useRefresh();

  const [open, setOpen] = useState(false);
  const [create, { isLoading }] = useCreate();

  const handleConfirm = () => {
    setOpen(false);

    create(
      'resetar-cartoes-lote',
      {
        data: {
          lote_id: loteId,
          reset_economico: true, // reset completo
        },
      },
      {
        onSuccess: (data: any) => {
          notify(formatarMensagemResultado(data), {
            type: 'success',
          });
          refresh();
        },
        onError: () => {
          notify('Erro ao resetar cartões', {
            type: 'error',
          });
        },
      }
    );
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<RestartAltIcon />}
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        Resetar todos
      </Button>

      <Confirm
        isOpen={open}
        title="Resetar todos os cartões"
        content={
          <>
            <strong>Atenção!</strong>
            <br />
            Esta ação irá:
            <ul>
              <li>Zerar o saldo de todos os cartões do lote</li>
              <li>Permitir cobrar a taxa novamente</li>
              <li>Desbloquear todos os cartões</li>
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

const CartaoListActions = () => {
  const navigate = useNavigate();
  const { eventoId } = useParams();

  return (
    <SmartToolbar>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          navigate(`/eventos/${eventoId}/lotes-cartoes`)
        }
      >
        Voltar
      </Button>

      <LimparTodosButton />
      <ResetarTodosButton />
    </SmartToolbar>
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
          <LimparButton />
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
      onClick={handleClick}
    >
      {record.bloqueado ? 'Desbloquear' : 'Bloquear'}
    </Button>
  );
};

export const LimparButton = () => {
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
          reset_economico: false, // limpeza simples
        },
      },
      {
        onSuccess: () => {
          notify('Cartão limpo com sucesso', {
            type: 'success',
          });
          refresh();
        },
        onError: () => {
          notify('Erro ao limpar cartão', {
            type: 'error',
          });
        },
      }
    );
  };

  return (
    <>
      <Button
        color="warning"
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        Limpar
      </Button>

      <Confirm
        isOpen={open}
        title="Limpar cartão"
        content={
          <>
            <strong>Atenção!</strong>
            <br />
            Esta ação irá:
            <ul>
              <li>Zerar o saldo do cartão</li>
              <li>Não permitirá cobrar a taxa novamente</li>
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
          reset_economico: true, // reset completo
        },
      },
      {
        onSuccess: () => {
          notify('Cartão resetado com sucesso', {
            type: 'success',
          });
          refresh();
        },
        onError: () => {
          notify('Erro ao resetar cartão', {
            type: 'error',
          });
        },
      }
    );
  };

  return (
    <>
      <Button
        color="error"
        startIcon={<RestartAltIcon />}
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        Resetar
      </Button>

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
              <li>Permitir cobrar a taxa novamente</li>
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
