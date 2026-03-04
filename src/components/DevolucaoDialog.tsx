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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNotify } from "react-admin";
import { supabase } from "../lib/supabaseClient";
import { CurrencyInput } from "./CurrencyInput";

interface Props {
  open: boolean;
  meioId: string;
  saldoAtual: number;
  operadorId: string;
  caixaId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DevolucaoDialog({
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
  const [observacao, setObservacao] = useState("");
  const [formaPagamentoId, setFormaPagamentoId] = useState("");
  const [formas, setFormas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function carregarFormas() {
      const { data } = await supabase
        .from("dominio_formas_pagamento")
        .select("id, descricao")
        .order("ordem");

      setFormas(data || []);
    }

    carregarFormas();
  }, [open]);

  function resetState() {
    setValor(0);
    setObservacao("");
    setFormaPagamentoId("");
  }

  async function handleConfirmar() {
    const valorNumerico = Number(valor);

    if (!valorNumerico || valorNumerico <= 0) {
      notify("Informe um valor válido", { type: "warning" });
      return;
    }

    if (valorNumerico > saldoAtual) {
      notify("Valor maior que o saldo disponível", { type: "error" });
      return;
    }

    if (!formaPagamentoId) {
      notify("Selecione a forma de pagamento", { type: "warning" });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.rpc("realizar_devolucao", {
        p_meio_id: meioId,
        p_valor: valorNumerico,
        p_operador_id: operadorId,
        p_forma_pagamento_id: formaPagamentoId,
        p_caixa_id: caixaId,
        p_observacao: observacao || null,
      });

      if (error) throw error;

      notify("Devolução realizada com sucesso", { type: "success" });

      resetState();
      onSuccess();
      onClose();
    } catch (err: any) {
      notify(err.message || "Erro ao realizar devolução", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>💸 Devolução de saldo</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography variant="caption">Saldo atual</Typography>
          <Typography variant="h6" color="primary">
            R$ {saldoAtual.toFixed(2)}
          </Typography>
        </Box>


        <CurrencyInput
          label="Valor da devolução"
          value={valor}
          onChange={(value) => setValor(value)}
        />


        <TextField
          select
          label="Forma de pagamento"
          value={formaPagamentoId}
          onChange={(e) => setFormaPagamentoId(e.target.value)}
          fullWidth
        >
          {formas.map((forma) => (
            <MenuItem key={forma.id} value={forma.id}>
              {forma.descricao}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Observação"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
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
          Confirmar devolução
        </Button>
      </DialogActions>
    </Dialog>
  );
}