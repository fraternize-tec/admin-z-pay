import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

export type ExportMovimentacoesFormat =
  | "pdf"
  | "csv"
  | "xlsx";

export interface ExportMovimentacoesOptions {
  format: ExportMovimentacoesFormat;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onExport: (
    options: ExportMovimentacoesOptions
  ) => Promise<void> | void;
}

export default function ExportMovimentacoesDialog({
  open,
  onClose,
  onExport,
}: Props) {
  const [format, setFormat] =
    useState<ExportMovimentacoesFormat>("pdf");

  const [loading, setLoading] = useState(false);

  const handleExport = async () => {

    try {

      setLoading(true);

      await onExport({
        format,
      });

      onClose();

    } finally {

      setLoading(false);

    }

  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Exportar Movimentações
      </DialogTitle>

      <DialogContent dividers>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
        >
          Escolha o formato do arquivo que deseja gerar.
        </Typography>

        <FormControl fullWidth>
          <RadioGroup
            value={format}
            onChange={(e) =>
              setFormat(
                e.target
                  .value as ExportMovimentacoesFormat
              )
            }
          >
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label="PDF"
            />

            <FormControlLabel
              value="xlsx"
              control={<Radio />}
              label="Excel (.xlsx)"
            />

            <FormControlLabel
              value="csv"
              control={<Radio />}
              label="CSV"
            />
          </RadioGroup>
          {loading && (
            <Typography
              variant="body2"
              color="text.secondary"
              mt={2}
            >
              Buscando todas as movimentações do período.
              Isso pode levar alguns segundos...
            </Typography>
          )}
        </FormControl>
      </DialogContent>

      <DialogActions>

        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={
            loading
              ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              )
              : undefined
          }
        >
          {loading
            ? "Exportando..."
            : "Exportar"}
        </Button>

      </DialogActions>
    </Dialog>
  );
}