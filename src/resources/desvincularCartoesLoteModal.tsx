import { Dialog, DialogTitle, DialogContent, Alert, TextField, RadioGroup, FormControlLabel, Radio, Stack, DialogActions, Typography } from "@mui/material";
import { useState } from "react";
import { useDataProvider, useNotify, useRefresh, Button } from "react-admin";

interface Props {
  open: boolean;
  onClose: () => void;
  cartao: any;
}

export const DesvincularCartoesLoteModal = ({
  open,
  onClose,
  cartao,
}: Props) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const [modo, setModo] = useState<'unico' | 'sequencia' | 'todos'>('unico');
  const [inicio, setInicio] = useState<number | ''>('');
  const [fim, setFim] = useState<number | ''>('');

  const handleConfirm = async () => {
    try {
      await dataProvider.create('desvincular-cartoes-evento', {
        data: {
          evento_id: cartao.evento_id,
          cartao_id: cartao.id,
          modo,
          sequencial_inicio: modo === 'sequencia' ? inicio : null,
          sequencial_fim: modo === 'sequencia' ? fim : null,
        },
      });

      notify('Cartões desvinculados com sucesso', { type: 'success' });
      refresh();
      onClose();
    } catch {
      notify('Erro ao desvincular cartões', { type: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Desvincular cartões</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            Os cartões desvinculados terão o saldo zerado.
          </Alert>

          <Typography>
            Evento: <strong>{cartao.evento_nome}</strong>
          </Typography>

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

            <FormControlLabel
              value="todos"
              control={<Radio />}
              label="Todos os cartões do evento"
            />
          </RadioGroup>

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
          color="error"
          onClick={handleConfirm}
        >
          Desvincular
        </Button>
      </DialogActions>
    </Dialog>
  );
};
