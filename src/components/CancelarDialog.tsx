import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!open) return;

    setMotivoId("");
    setObs("");

    supabase
      .from("dominio_cancelamentos")
      .select("id, descricao")
      .then(({ data }) => setMotivos(data || []));
  }, [open]);

  async function confirmar() {
    if (!motivoId) {
      notify("Selecione um motivo", { type: "warning" });
      return;
    }

    try {
      setLoading(true);

      await cancelarOperacao({
        tipo,
        id: record.id,
        motivo_id: motivoId,
        observacao: obs,
      });

      notify("Operação cancelada com sucesso", {
        type: "success",
      });

      onSuccess?.(); // 🔥 AVISA O PAI
      onClose();     // fecha o dialog
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

      <DialogContent sx={{ display: "flex", gap: 2, mt: 1 }}>
        <TextField
          select
          label="Motivo"
          fullWidth
          value={motivoId}
          onChange={(e) => setMotivoId(e.target.value)}
        >
          {motivos.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.descricao}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Observação"
          fullWidth
          multiline
          minRows={3}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
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
          Confirmar cancelamento
        </Button>
      </DialogActions>
    </Dialog>
  );
}
