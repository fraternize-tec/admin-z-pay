import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNotify } from "react-admin";
import { supabase } from "../lib/supabaseClient";
import { CurrencyInput } from "./CurrencyInput";
import { formatBRL } from "../utils/formatters";

interface Props {
  open: boolean;
  meioId: string;
  saldoAtual: number;
  operadorId: string;
  caixaId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CortesiaDialog({
  open,
  meioId,
  saldoAtual,
  operadorId,
  caixaId = null,
  onClose,
  onSuccess,
}: Props) {
  const notify = useNotify();

  const [valor, setValor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [caixas, setCaixas] = useState<any[]>([]);
  const [caixaSelecionado, setCaixaSelecionado] = useState<string | null>(caixaId);

  const nomeCaixa = caixas.find(c => c.id === caixaId)?.nome;

  useEffect(() => {
    if (!open) return;

    async function carregarDados() {

      // caixas do evento do cartão
      const { data: meio } = await supabase
        .from("meios_acesso")
        .select("evento_id")
        .eq("id", meioId)
        .single();

      if (meio?.evento_id) {
        const { data: caixasData } = await supabase
          .from("caixas")
          .select("id, nome")
          .eq("evento_id", meio.evento_id)
          .eq("status", "aberto")
          .order("nome");

        setCaixas(caixasData || []);
      }
    }

    carregarDados();
  }, [open, meioId]);

  function resetState() {
    setValor(0);
    setCaixaSelecionado(caixaId ?? null);
  }

  async function handleConfirmar() {
    const valorNumerico = Number(valor);

    if (!valorNumerico || valorNumerico <= 0) {
      notify("Informe um valor válido", { type: "warning" });
      return;
    }

    if (valorNumerico > 600) {
      notify("Valor maior que o limite de cortesia", { type: "error" });
      return;
    }

    const caixaFinal = caixaId ?? caixaSelecionado;

    if (!caixaFinal) {
      notify("Selecione o caixa da cortesia", { type: "warning" });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("dar_cortesia", {
        p_meio_id: meioId,
        p_caixa_id: caixaSelecionado,
        p_valor: valorNumerico
      });

      if (error) throw error;

      notify("Cortesia realizada com sucesso", { type: "success" });

      resetState();
      onSuccess();
      onClose();
    } catch (err: any) {
      notify(err.message || "Erro ao realizar cortesia", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>💰 Dar cortesia</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography variant="caption">Saldo atual</Typography>
          <Typography variant="h6" color="primary">
            {formatBRL(saldoAtual)}
          </Typography>
        </Box>

        {caixaId && nomeCaixa && (
          <Chip
            size="small"
            label={`Caixa: ${nomeCaixa}`}
            color="primary"
            variant="outlined"
          />
        )}

        <CurrencyInput
          label="Valor da cortesia"
          value={valor}
          onChange={(value) => setValor(value)}
        />

        {!caixaId && (
          <TextField
            select
            label="Caixa da cortesia"
            value={caixaSelecionado ?? ""}
            onChange={(e) => setCaixaSelecionado(e.target.value)}
            fullWidth
            required
          >
            {caixas.map((cx) => (
              <MenuItem key={cx.id} value={cx.id}>
                {cx.nome}
              </MenuItem>
            ))}
          </TextField>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          color="error"
          onClick={handleConfirmar}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          Confirmar cortesia
        </Button>
      </DialogActions>
    </Dialog>
  );
}