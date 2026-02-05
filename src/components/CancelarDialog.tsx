import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useEffect, useMemo, useState } from "react";
import { useNotify } from "react-admin";
import { supabase } from "../lib/supabaseClient";
import { cancelarOperacao } from "../data/cancelarOperacao";

export function CancelarDialog({
  open,
  onClose,
  onSuccess,
  tipo,
  record,
}: any) {
  const notify = useNotify();

  const [motivos, setMotivos] = useState<any[]>([]);
  const [motivoId, setMotivoId] = useState("");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const [itens, setItens] = useState<any[]>([]);
  const [quantidades, setQuantidades] =
    useState<Record<string, number>>({});

  // ============================
  // 🔄 abertura
  // ============================
  useEffect(() => {
    if (!open || !record?.id || !tipo) return;

    setMotivoId("");
    setObs("");
    setItens([]);
    setQuantidades({});

    supabase
      .from("dominio_cancelamentos")
      .select("id, descricao")
      .then(({ data }) => setMotivos(data || []));

    if (tipo === "consumo") {
      supabase
        .from("consumo_itens")
        .select(`
          id,
          quantidade,
          valor_unitario,
          item:itens ( nome )
        `)
        .eq("consumo_id", record.id)
        .then(({ data }) => {
          setItens(data || []);
          const inicial: Record<string, number> = {};
          data?.forEach(i => (inicial[i.id] = 0));
          setQuantidades(inicial);
        });
    }
  }, [open, tipo, record?.id]);

  // ============================
  // 🧠 modo de cancelamento
  // ============================
  const possuiItensSelecionados = useMemo(
    () => Object.values(quantidades).some(q => q > 0),
    [quantidades]
  );

  const modoCancelamento =
    tipo !== "consumo"
      ? "total"
      : possuiItensSelecionados
        ? "parcial"
        : "total";

  // ============================
  // ➕➖ ajustar quantidade
  // ============================
  function alterarQuantidade(
    itemId: string,
    delta: number,
    max: number
  ) {
    setQuantidades(q => {
      const atual = q[itemId] || 0;
      const novo = Math.min(Math.max(atual + delta, 0), max);
      return { ...q, [itemId]: novo };
    });
  }

  // ============================
  // ✅ confirmar
  // ============================
  async function confirmar() {
    if (!motivoId) {
      notify("Selecione um motivo", { type: "warning" });
      return;
    }

    const itensSelecionados =
      tipo === "consumo"
        ? Object.entries(quantidades)
            .filter(([, q]) => q > 0)
            .map(([id, quantidade]) => ({
              consumo_item_id: id,
              quantidade,
            }))
        : [];

    try {
      setLoading(true);

      await cancelarOperacao({
        tipo,
        id: record.id,
        motivo_id: motivoId,
        observacao: obs,
        ...(itensSelecionados.length > 0 && {
          itens: itensSelecionados,
        }),
      });

      notify(
        modoCancelamento === "parcial"
          ? "Cancelamento parcial realizado com sucesso"
          : "Operação cancelada com sucesso",
        { type: "success" }
      );

      onSuccess?.();
      onClose();
    } catch (e: any) {
      notify(
        e.message || "Erro ao cancelar operação",
        { type: "error" }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Cancelar {tipo === "recarga" ? "recarga" : "consumo"}
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {/* MOTIVO */}
        <TextField
          select
          label="Motivo"
          fullWidth
          value={motivoId}
          onChange={e => setMotivoId(e.target.value)}
        >
          {motivos.map(m => (
            <MenuItem key={m.id} value={m.id}>
              {m.descricao}
            </MenuItem>
          ))}
        </TextField>

        {/* ITENS (somente consumo) */}
        {tipo === "consumo" && itens.length > 0 && (
          <Box
            sx={{
              border:
                modoCancelamento === "parcial"
                  ? "1px dashed #f59e0b"
                  : "1px dashed transparent",
              borderRadius: 1,
              p: 1,
            }}
          >
            <Typography variant="subtitle2">
              Itens do consumo
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              {modoCancelamento === "parcial"
                ? "Você está realizando um cancelamento parcial. O valor a ser devolvido será correspondente a quantidade de itens que serão cancelados."
                : "Nenhum item selecionado. O consumo será cancelado por completo."}
            </Typography>

            {itens.map(i => (
              <Box
                key={i.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Box>
                  <Typography>{i.item.nome}</Typography>
                  <Typography variant="caption">
                    Consumido: {i.quantidade}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      alterarQuantidade(i.id, -1, i.quantidade)
                    }
                  >
                    <RemoveIcon />
                  </IconButton>

                  <Typography width={20} textAlign="center">
                    {quantidades[i.id] || 0}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() =>
                      alterarQuantidade(i.id, 1, i.quantidade)
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* OBS */}
        <TextField
          label="Observação"
          fullWidth
          multiline
          minRows={3}
          value={obs}
          onChange={e => setObs(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Voltar
        </Button>

        <Button
          color="error"
          onClick={confirmar}
          disabled={loading}
        >
          {modoCancelamento === "parcial"
            ? "Confirmar cancelamento parcial"
            : "Confirmar cancelamento"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
