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
  ListBase,
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
  useGetList,
  BooleanInput,
  BooleanField,
} from 'react-admin';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { Autocomplete, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, TextField as MuiTextField, Radio, RadioGroup } from '@mui/material';
import { CartoesDoLoteButton } from './cartoes';
import { ExportarCartoesPdf } from './exportarCartoesPdf';
import { supabase } from '../lib/supabaseClient';
import { ExportarCartoesPdfDialog } from './exportarCartoesPdfDialog';
import { BackToListButtonNavigate } from '../components/BackToListButton';
import { SmartToolbar } from '../components/SmartToolbar';


const LoteListActions = () => {
  const { eventoId } = useParams();

  return (
    <SmartToolbar>
      <BackToListButtonNavigate />
      <CreateButton
        resource="lotes_cartoes"
        to={`/eventos/${eventoId}/lotes-cartoes/create`}
      />
    </SmartToolbar>
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

export const LoteCartaoProprioList = () => (
  <ListBase
    resource="vw_lotes_cartoes_proprios"
    perPage={25}
  >
    <SmartToolbar>
      <BackToListButtonNavigate />
      <CreateButton
        resource="lotes_cartoes"
        to="/lotes_cartoes/create?tipo=proprio"
      />
    </SmartToolbar>

    <Datagrid rowClick={(id, resource, record) =>
      `/lotes_cartoes/${record.id}`
    }>
      <LoteStatusField />
      <ReferenceField
        source="evento_atual_id"
        reference="eventos"
        label="Evento atual"
      >
        <TextField source="nome" />
      </ReferenceField>
      <TextField source="nome" />
      <TextField source="prefixo_codigo" />
      <NumberField source="sequencial_inicio" />
      <NumberField source="sequencial_fim" />
      <NumberField source="quantidade" />
      <DateField source="criado_em" showTime />
    </Datagrid>

    <Pagination />
  </ListBase>
);

export const LoteCartaoListEvento = () => {
  const { eventoId } = useParams();

  return (
    <ListBase
      resource="vw_lotes_cartoes_evento"
      filter={{ evento_referencia_id: eventoId }}
      perPage={25}
    >
      <LoteListActions />

      <Datagrid
        rowClick={(id, resource, record) =>
          `/lotes_cartoes/${record.id}`
        }
      >
        <LoteStatusField />

        <ReferenceField
          source="evento_atual_id"
          reference="eventos"
          label="Evento atual"
        >
          <TextField source="nome" />
        </ReferenceField>

        <TextField source="nome" />
        <TextField source="prefixo_codigo" />
        <NumberField source="sequencial_inicio" />
        <NumberField source="sequencial_fim" />
        <NumberField source="quantidade" />
        <DateField source="criado_em" showTime />

        <BooleanField
          source="cobra_taxa_primeira_recarga"
          label="Cobra taxa"
        />
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
        variant="outlined"
        startIcon={<CreditCardIcon />}
        onClick={() => setOpen(true)}
      >
        Gerar cartões
      </Button>

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
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const tipo = params.get('tipo');

  const isProprio = tipo === 'proprio';

  const handleBack = () => {
    if (isProprio) {
      navigate('/vw_lotes_cartoes_proprios');
    } else {
      navigate(`/eventos/${eventoId}/lotes-cartoes`);
    }
  };

  return (
    <Create
      resource="lotes_cartoes"
      actions={
        <SmartToolbar>
          <BackToListButtonNavigate />
        </SmartToolbar>
      }
      transform={(data) => ({
        ...data,
        prefixo_codigo: isProprio
          ? 'ZPAY'
          : data.prefixo_codigo,

        evento_id: isProprio ? null : eventoId,
        tipo_lote: isProprio ? 'proprio' : 'evento',
      })}
      mutationOptions={{
        onSuccess: () => {
          handleBack();
        },
      }}
    >
      <SimpleForm
        defaultValues={{
          prefixo_codigo: isProprio ? 'ZPAY' : '',
          cobra_taxa_primeira_recarga: true,
        }}
      >
        <TextInput
          source="nome"
          label="Nome do lote"
          fullWidth
        />

        <TextInput
          source="prefixo_codigo"
          label="Prefixo do cartão"
          validate={required()}
          fullWidth
          disabled={isProprio}
        />

        <NumberInput
          source="sequencial_inicio"
          validate={required()}
        />

        <NumberInput
          source="quantidade"
          validate={required()}
        />

        <BooleanInput
          source="cobra_taxa_primeira_recarga"
          label="Cobrar taxa na primeira recarga"
          defaultValue={true}
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
        variant="outlined" startIcon={<PictureAsPdfIcon />}
        onClick={() => setOpen(true)}
      >
        Exportar cartões
      </Button>

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
        variant="outlined" disabled
        onClick={() =>
          notify(
            'Não é possível excluir um lote com cartões gerados',
            { type: 'warning' }
          )
        }
      >
        Excluir
      </Button>
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
      variant="outlined"
      onClick={handleClick}
    >
      Marcar como impresso
    </Button>
  );
};

const BackToEventoLotesButton = ({ record }: ActionProps) => {
  const navigate = useNavigate();

  if (!record?.evento_id) return null;

  return (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={() =>
        navigate(`/eventos/${record.evento_id}/lotes-cartoes`)
      }
    >
      Voltar
    </Button>
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
    <SmartToolbar>
      <BackToEventoLotesButton record={view} />

      {view.tipo_lote === 'proprio' && (
        <>
          <BackToListButtonNavigate />
          <DividirLoteButton record={view} />
        </>
      )}

      {view.tipo_lote === 'proprio' &&
        !view.evento_atual_id && (
          <VincularLoteEventoButton record={view} />
        )}

      {view.tipo_lote === 'proprio' &&
        view.evento_atual_id && (
          <>
            <TransferirLoteEventoButton record={view} />
            <DesvincularLoteButton record={view} />
          </>
        )}

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
    </SmartToolbar>
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
        // Começa com os campos editáveis
        const updates: any = {
          nome: data.nome,
          cobra_taxa_primeira_recarga:
            data.cobra_taxa_primeira_recarga,
        };

        const upload = async (
          file: any,
          nomeArquivo: string
        ) => {
          const path = `eventos/${data.evento_id}/lotes/${data.id}/${nomeArquivo}.png`;

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

        // Upload da arte frente
        if (
          data.arte_frente_file &&
          data.arte_frente_file.rawFile
        ) {
          updates.arte_frente_url = await upload(
            data.arte_frente_file,
            'frente'
          );
        }

        // Upload da arte verso
        if (
          data.arte_verso_file &&
          data.arte_verso_file.rawFile
        ) {
          updates.arte_verso_url = await upload(
            data.arte_verso_file,
            'verso'
          );
        }

        return updates;
      }}
    >
      <SimpleForm>
        <TextInput
          source="nome"
          label="Nome do lote"
          fullWidth
        />

        <TextInput
          source="prefixo_codigo"
          disabled
          fullWidth
        />

        <NumberInput
          source="sequencial_inicio"
          disabled
        />

        <NumberInput
          source="sequencial_fim"
          disabled
        />

        <NumberInput
          source="quantidade"
          disabled
        />

        <BooleanInput
          source="cobra_taxa_primeira_recarga"
          label="Cobrar taxa na primeira recarga"
        />

        <ImageInput
          source="arte_frente_file"
          label="Arte frente"
        >
          <ImageField source="src" />
        </ImageInput>

        <PreviewArte
          source="arte_frente_url"
          label="Arte frente atual"
        />

        <ImageInput
          source="arte_verso_file"
          label="Arte verso"
        >
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

interface ActionProps {
  record?: any;
}

export const VincularLoteEventoButton = ({
  record,
}: ActionProps) => {
  const [open, setOpen] = useState(false);
  const [eventoId, setEventoId] =
    useState<string | null>(null);

  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  const { data: eventos = [], isLoading } = useGetList(
    'eventos',
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'nome', order: 'ASC' },
      filter: { ativo: true },
    }
  );

  if (!record) return null;
  if (record.tipo_lote !== 'proprio') return null;
  if (record.status_lote === 'criado') return null;

  const handleConfirm = async () => {
    if (!eventoId) {
      notify('Selecione um evento', {
        type: 'warning',
      });
      return;
    }

    try {
      await dataProvider.create(
        'vincular-lote-evento',
        {
          data: {
            lote_id: record.id,
            evento_id: eventoId,
          },
        }
      );

      notify('Lote vinculado com sucesso', {
        type: 'success',
      });

      setOpen(false);
      setEventoId(null);
      refresh();
    } catch (error: any) {
      notify(
        error?.body?.error ||
        'Erro ao vincular lote',
        {
          type: 'error',
        }
      );
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<LinkIcon />}
        onClick={() => setOpen(true)}
      >
        Vincular a evento
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Vincular lote ao evento
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            options={eventos}
            loading={isLoading}
            getOptionLabel={(option) =>
              option.nome ?? ''
            }
            value={
              eventos.find(
                (e) => e.id === eventoId
              ) ?? null
            }
            onChange={(_, value) =>
              setEventoId(value?.id ?? null)
            }
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Evento"
                fullWidth
                margin="normal"
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!eventoId}
          >
            Vincular
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};



export const DesvincularLoteButton = ({
  record,
}: ActionProps) => {
  const [open, setOpen] = useState(false);
  const [zerarSaldo, setZerarSaldo] = useState(true);

  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;
  if (record.tipo_lote !== 'proprio') return null;
  if (!record.evento_atual_id) return null;

  const handleConfirm = async () => {
    try {
      await dataProvider.create(
        'desvincular-lote-evento',
        {
          data: {
            lote_id: record.id,
            zerar_saldo: zerarSaldo,
          },
        }
      );

      notify('Lote desvinculado com sucesso', {
        type: 'success',
      });

      setOpen(false);
      refresh();
    } catch (error: any) {
      notify(
        error?.body?.error ||
        'Erro ao desvincular lote',
        {
          type: 'error',
        }
      );
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<LinkOffIcon />}
        onClick={() => setOpen(true)}
      >
        Devolver ao estoque
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Devolver lote ao estoque</DialogTitle>

        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={zerarSaldo}
                onChange={(e) =>
                  setZerarSaldo(e.target.checked)
                }
              />
            }
            label="Limpar saldo dos cartões"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const TransferirLoteEventoButton = ({
  record,
}: ActionProps) => {
  const [open, setOpen] = useState(false);
  const [eventoId, setEventoId] = useState<string | null>(null);
  const [zerarSaldo, setZerarSaldo] = useState(false);

  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  const { data: eventos = [], isLoading } = useGetList(
    'eventos',
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'nome', order: 'ASC' },
      filter: { ativo: true },
    }
  );

  if (!record) return null;
  if (record.tipo_lote !== 'proprio') return null;
  if (!record.evento_atual_id) return null;

  const handleClose = () => {
    setOpen(false);
    setEventoId(null);
    setZerarSaldo(false);
  };

  const handleConfirm = async () => {
    if (!eventoId) {
      notify('Selecione o evento de destino', {
        type: 'warning',
      });
      return;
    }

    try {
      await dataProvider.create('transferir-lote-evento', {
        data: {
          lote_id: record.id,
          evento_id: eventoId,
          zerar_saldo: zerarSaldo,
        },
      });

      notify('Lote transferido com sucesso', {
        type: 'success',
      });

      handleClose();
      refresh();
    } catch (error: any) {
      notify(
        error?.body?.error ??
        'Erro ao transferir lote',
        {
          type: 'error',
        }
      );
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<SwapHorizIcon />}
        onClick={() => setOpen(true)}
      >
        Transferir
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Transferir lote para outro evento
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            options={eventos.filter(
              (e) => e.id !== record.evento_atual_id
            )}
            loading={isLoading}
            getOptionLabel={(option) =>
              option.nome ?? ''
            }
            value={
              eventos.find(
                (e) => e.id === eventoId
              ) ?? null
            }
            onChange={(_, value) =>
              setEventoId(value?.id ?? null)
            }
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Evento destino"
                fullWidth
                margin="normal"
              />
            )}
          />

          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={zerarSaldo}
                onChange={(e) =>
                  setZerarSaldo(
                    e.target.checked
                  )
                }
              />
            }
            label="Limpar saldo dos cartões"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!eventoId}
          >
            Transferir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const DividirLoteButton = ({
  record,
}: ActionProps) => {
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<
    'intervalo' | 'nao_utilizados'
  >('intervalo');
  const [sequencialInicio, setSequencialInicio] =
    useState<string>('');
  const [sequencialFim, setSequencialFim] =
    useState<string>('');

  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;
  if ((record.total_cartoes ?? 0) <= 1) return null;
  if (record.status_lote === 'criado') return null;

  const handleClose = () => {
    setOpen(false);
    setModo('intervalo');
    setSequencialInicio('');
    setSequencialFim('');
  };

  const handleConfirm = async () => {
    if (modo === 'intervalo') {
      if (!sequencialInicio || !sequencialFim) {
        notify(
          'Informe o sequencial inicial e final',
          { type: 'warning' }
        );
        return;
      }

      if (
        Number(sequencialFim) <
        Number(sequencialInicio)
      ) {
        notify(
          'O sequencial final deve ser maior ou igual ao inicial',
          { type: 'warning' }
        );
        return;
      }
    }

    try {
      await dataProvider.create(
        'dividir-lote-cartoes',
        {
          data: {
            lote_id: record.id,
            modo,
            ...(modo === 'intervalo'
              ? {
                sequencial_inicio: Number(
                  sequencialInicio
                ),
                sequencial_fim: Number(
                  sequencialFim
                ),
              }
              : {}),
          },
        }
      );

      notify('Lote dividido com sucesso', {
        type: 'success',
      });

      handleClose();
      refresh();
    } catch (error: any) {
      notify(
        error?.body?.error ??
        'Erro ao dividir lote',
        {
          type: 'error',
        }
      );
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CallSplitIcon />}
        onClick={() => setOpen(true)}
      >
        Dividir lote
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Dividir lote de cartões
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">
              Critério de divisão
            </FormLabel>

            <RadioGroup
              value={modo}
              onChange={(e) =>
                setModo(
                  e.target
                    .value as
                  | 'intervalo'
                  | 'nao_utilizados'
                )
              }
            >
              <FormControlLabel
                value="intervalo"
                control={<Radio />}
                label="Por intervalo de sequência"
              />

              <FormControlLabel
                value="nao_utilizados"
                control={<Radio />}
                label="Cartões não utilizados no evento atual"
              />
            </RadioGroup>
          </FormControl>

          {modo === 'intervalo' && (
            <>
              <MuiTextField
                label="Sequencial inicial"
                type="number"
                fullWidth
                margin="normal"
                value={sequencialInicio}
                onChange={(e) =>
                  setSequencialInicio(
                    e.target.value
                  )
                }
              />

              <MuiTextField
                label="Sequencial final"
                type="number"
                fullWidth
                margin="normal"
                value={sequencialFim}
                onChange={(e) =>
                  setSequencialFim(
                    e.target.value
                  )
                }
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirm}
          >
            Dividir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};