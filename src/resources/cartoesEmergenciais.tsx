import {
    ListBase,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    DateField,
    Pagination,
    TopToolbar,
    Button,
    useRecordContext,
    useNotify,
    useRefresh,
    useDataProvider,
    Confirm,
    useCreate,
} from 'react-admin';
import { useParams } from 'react-router-dom';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BlockIcon from '@mui/icons-material/Block';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Chip } from '@mui/material';
import { useState } from 'react';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { CartaoQrDialog } from './cartoes';

/* ===================================================== */
/* STATUS DO VÍNCULO */
/* ===================================================== */
const StatusVinculoField = () => {
    const record = useRecordContext();

    if (!record) return null;

    if (record.status_vinculo === 'ativo') {
        return <Chip label="Ativo" color="success" size="small" />;
    }

    return <Chip label="Encerrado" size="small" />;
};

/* ===================================================== */
/* TOPO */
/* ===================================================== */
const CartoesEventoActions = () => {
    return (
        <TopToolbar>
            <BackToListButtonNavigate />
        </TopToolbar>
    );
};

const QrCartaoEventoButton = ({
  onClick,
}: {
  onClick: (record: any) => void;
}) => {
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

/* ===================================================== */
/* LISTA */
/* ===================================================== */
export const CartoesPropriosEventoList = () => {
  const { eventoId } = useParams();
  const [selected, setSelected] = useState<any>(null);

  const filter = eventoId
    ? {
        evento_id: eventoId,
        status_vinculo: 'ativo',
      }
    : undefined;

  if (!eventoId) return null;

  return (
    <>
      <ListBase
        resource="vw_evento_cartoes_proprios"
        filter={filter}
        perPage={25}
        disableSyncWithLocation
      >
        <CartoesEventoActions />

        <Datagrid rowClick={false}>
          <StatusVinculoField />
          <TextField source="codigo_unico" label="Cartão" />
          <NumberField source="saldo" />
          <BooleanField source="bloqueado" />
          <DateField source="data_entrada" showTime />

          <BloquearCartaoEventoButton />
          <ResetarCartaoEventoButton />

          {/* 👇 QR */}
          <QrCartaoEventoButton onClick={setSelected} />
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


const BloquearCartaoEventoButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();

    if (!record) return null;

    const handleClick = async () => {
        try {
            await dataProvider.create('bloquear-cartao', {
                data: {
                    cartao_id: record.cartao_id,
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
            startIcon={<BlockIcon />}
            onClick={(e) => {
                e.stopPropagation();
                handleClick();
            }}
        />
    );
};


const ResetarCartaoEventoButton = () => {
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
                    cartao_id: record.cartao_id,
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
                label="Resetar"
                color="error"
                startIcon={<RestartAltIcon />}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                }}
                disabled={isLoading}
            />

            <Confirm
                isOpen={open}
                title="Resetar cartão"
                content={
                    <>
                        <strong>Atenção!</strong>
                        <br />
                        Esta ação irá zerar o saldo do cartão.
                        <br />
                        Deseja continuar?
                    </>
                }
                onConfirm={handleConfirm}
                onClose={() => setOpen(false)}
            />
        </>
    );
};
