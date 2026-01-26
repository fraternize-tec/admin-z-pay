import {
  useNotify,
  useRefresh,
  useDataProvider,
  Button,
} from 'react-admin';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  cartao: any;
}

export const VincularCartaoModal = ({ open, onClose, cartao }: Props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoId, setEventoId] = useState('');
  const [modo, setModo] = useState<'unico' | 'sequencia'>('unico');
  const [inicio, setInicio] = useState<number | ''>('');
  const [fim, setFim] = useState<number | ''>('');

  // 🔹 carrega eventos
  useEffect(() => {
    dataProvider
      .getList('eventos', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'nome', order: 'ASC' },
        filter: {},
      })
      .then(({ data }) => setEventos(data))
      .catch(() =>
        notify('Erro ao carregar eventos', { type: 'error' })
      );
  }, []);

  const handleConfirm = async () => {
    try {
      await dataProvider.create('vincular-cartoes-evento', {
        data: {
          evento_id: eventoId,
          cartao_id: cartao.id,
          modo,
          sequencial_inicio: modo === 'sequencia' ? inicio : null,
          sequencial_fim: modo === 'sequencia' ? fim : null,
        },
      });

      notify('Cartões vinculados com sucesso', { type: 'success' });
      refresh();
      onClose();
    } catch {
      notify('Erro ao vincular cartões', { type: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular cartões</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            Cartão: <strong>{cartao.codigo_unico}</strong>
          </Typography>

          {/* EVENTO */}
          <FormControl fullWidth>
            <InputLabel>Evento</InputLabel>
            <Select
              value={eventoId}
              label="Evento"
              onChange={(e) => setEventoId(e.target.value)}
            >
              {eventos.map((evento) => (
                <MenuItem key={evento.id} value={evento.id}>
                  {evento.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* MODO */}
          <RadioGroup
            value={modo}
            onChange={(e) => setModo(e.target.value as any)}
          >
            <FormControlLabel
              value="unico"
              control={<Radio />}
              label="Somente este cartão"
            />
            <FormControlLabel
              value="sequencia"
              control={<Radio />}
              label="Sequência de cartões"
            />
          </RadioGroup>

          {/* SEQUÊNCIA */}
          {modo === 'sequencia' && (
            <Stack direction="row" spacing={2}>
              <TextField
                label="Sequencial início"
                type="number"
                fullWidth
                value={inicio}
                onChange={(e) => setInicio(Number(e.target.value))}
              />
              <TextField
                label="Sequencial fim"
                type="number"
                fullWidth
                value={fim}
                onChange={(e) => setFim(Number(e.target.value))}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!eventoId}
          onClick={handleConfirm}
        >
          Vincular
        </Button>
      </DialogActions>
    </Dialog>
  );
};
