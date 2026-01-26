// ExportarCartoesPdfDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (modo: 'pdf' | 'zip') => void;
}

export const ExportarCartoesPdfDialog = ({
  open,
  onClose,
  onConfirm,
}: Props) => {
  const [modo, setModo] = useState<'pdf' | 'zip'>('pdf');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Exportar cartões</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            Como deseja gerar os arquivos?
          </Typography>

          <RadioGroup
            value={modo}
            onChange={(e) => setModo(e.target.value as any)}
          >
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label="PDFs separados"
            />
            <FormControlLabel
              value="zip"
              control={<Radio />}
              label="ZIP com todos os PDFs"
            />
          </RadioGroup>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(modo)}
        >
          Gerar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
