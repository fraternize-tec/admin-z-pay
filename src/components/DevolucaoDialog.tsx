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
  const [caixas, setCaixas] = useState<any[]>([]);
  const [caixaSelecionado, setCaixaSelecionado] = useState<string | null>(caixaId);

  const nomeCaixa = caixas.find(c => c.id === caixaId)?.nome;

  useEffect(() => {
    if (!open) return;

    async function carregarDados() {

      // formas pagamento
      const { data: formasData } = await supabase
        .from("dominio_formas_pagamento")
        .select("id, descricao")
        .order("ordem");

      setFormas(formasData || []);

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
    setObservacao("");
    setFormaPagamentoId("");
    setCaixaSelecionado(caixaId ?? null);
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

    const caixaFinal = caixaId ?? caixaSelecionado;

    if (!caixaFinal) {
      notify("Selecione o caixa da devolução", { type: "warning" });
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
        p_caixa_id: caixaFinal,
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

        {caixaId && nomeCaixa && (
          <Chip
            size="small"
            label={`Caixa: ${nomeCaixa}`}
            color="primary"
            variant="outlined"
          />
        )}

        <CurrencyInput
          label="Valor da devolução"
          value={valor}
          onChange={(value) => setValor(value)}
        />

        {!caixaId && (
          <TextField
            select
            label="Caixa da devolução"
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


        <TextField
          select
          label="Forma de pagamento"
          value={formaPagamentoId}
          onChange={(e) => setFormaPagamentoId(e.target.value)}
          required
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